import 'server-only'
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from './prisma'
import { HttpError } from './http-error'
export { HttpError } from './http-error'

export interface AdminUser { id: string; email: string; name: string; role: 'admin' | 'editor' }
export const SESSION_COOKIE = 'dokita_session'
const SESSION_SECONDS = 60 * 60 * 12
function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key)))
}

export function apiError(error: unknown) {
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status })
  if (error instanceof SyntaxError) return Response.json({ error: 'The request contains invalid JSON.' }, { status: 400 })
  console.error('[admin] Operation failed', error instanceof Error ? error.message : 'Unknown error')
  return Response.json({ error: 'The operation could not be completed. Please try again.' }, { status: 500 })
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const expected = new URL(request.url).origin
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  const allowed = [expected]
  if (configured) {
    try { allowed.push(new URL(configured).origin) } catch { /* An invalid deployment URL is not trusted. */ }
  }
  if (!origin || !allowed.includes(origin) || request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new HttpError(403, 'This request must come from this website.')
  }
}

export async function rateLimit(key: string, maximum: number, seconds: number) {
  const now = Math.floor(Date.now() / 1000)
  const hashed = createHash('sha256').update(key).digest('hex')
  await prisma.$executeRaw`INSERT INTO rate_limits (key,hits,reset_at) VALUES (${hashed},1,${now + seconds})
    ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN reset_at<=${now} THEN 1 ELSE hits+1 END,
    reset_at=CASE WHEN reset_at<=${now} THEN ${now + seconds} ELSE reset_at END`
  const row = await prisma.rate_limits.findUnique({ where: { key: hashed }, select: { hits: true } })
  if ((row?.hits ?? 0) > maximum) throw new HttpError(429, 'Too many attempts. Please wait before trying again.')
}

export function validatePassword(password: unknown): asserts password is string {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) throw new HttpError(400, 'Use a password of 12–128 characters.')
}

export async function hashPassword(password: string) {
  validatePassword(password)
  const salt = randomBytes(16).toString('hex')
  const derived = await derive(password, salt)
  return `scrypt$32768$${salt}$${derived.toString('hex')}`
}

async function verifyPassword(password: string, stored: string) {
  const [scheme, cost, salt, digest] = stored.split('$')
  if (scheme !== 'scrypt' || cost !== '32768' || !salt || !digest) return false
  const expected = Buffer.from(digest, 'hex')
  const actual = await derive(password, salt)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex')

export async function getCurrentUser(): Promise<AdminUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null
  const row = await prisma.sessions.findFirst({ where: { token_hash: tokenHash(token), expires_at: { gt: new Date().toISOString() }, users: { active: 1 } }, include: { users: true } })
  return row ? { id: row.users.id, email: row.users.email, name: row.users.name, role: row.users.role as AdminUser['role'] } : null
}

export async function requireStaff() {
  const user = await getCurrentUser()
  if (!user) throw new HttpError(401, 'Please sign in to continue.')
  return user
}

export async function requireAdmin() {
  const user = await requireStaff()
  if (user.role !== 'admin') throw new HttpError(403, 'Administrator access is required.')
  return user
}

export async function requirePageStaff() {
  const user=await getCurrentUser()
  if(!user)redirect('/admin/login')
  return user
}
export async function requirePageAdmin() {
  const user=await requirePageStaff()
  if(user.role!=='admin')redirect('/admin')
  return user
}

export async function changePassword(user:AdminUser,currentPassword:unknown,newPassword:unknown) {
  await rateLimit(`change-password:${user.id}`,5,15*60)
  if(typeof currentPassword!=='string'||currentPassword.length>128)throw new HttpError(400,'Enter your current password.')
  validatePassword(newPassword)
  const row=await prisma.users.findUnique({where:{id:user.id},select:{password_hash:true}})
  if(!row||!await verifyPassword(currentPassword,row.password_hash))throw new HttpError(400,'Your current password is incorrect.')
  const hash=await hashPassword(newPassword)
  const now = new Date().toISOString()
  await prisma.$transaction([
    prisma.users.update({where:{id:user.id},data:{password_hash:hash,updated_at:now}}),
    prisma.sessions.deleteMany({where:{user_id:user.id}}),
    prisma.audit_log.create({data:{id:randomUUID(),user_id:user.id,action:'user.password_change',target_id:user.id,details:'{}',created_at:now}}),
  ])
  ;(await cookies()).delete(SESSION_COOKIE)
}

export async function login(email: unknown, password: unknown, request: Request) {
  assertSameOrigin(request)
  if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || password.length > 128) throw new HttpError(400, 'Enter your email address and password.')
  const normalized = email.trim().toLowerCase()
  await rateLimit(`login-account:${normalized}`, 10, 15 * 60)
  await rateLimit(`login-ip:${request.headers.get('x-forwarded-for')?.split(',')[0] || 'local'}`, 30, 15 * 60)
  const row = await prisma.users.findUnique({ where: { email: normalized }, select: { id: true, password_hash: true, active: true } })
  const dummy = 'scrypt$32768$00000000000000000000000000000000$' + '00'.repeat(64)
  const valid = await verifyPassword(password, row?.password_hash ?? dummy)
  if (!row || !valid || row.active !== 1) throw new HttpError(401, 'The email address or password is incorrect.')
  const token = randomBytes(32).toString('hex')
  const now = new Date()
  const oldToken = (await cookies()).get(SESSION_COOKIE)?.value
  await prisma.$transaction(async tx => {
    if (oldToken) await tx.sessions.deleteMany({ where: { token_hash: tokenHash(oldToken) } })
    await tx.sessions.deleteMany({ where: { expires_at: { lte: now.toISOString() } } })
    await tx.sessions.create({ data: { token_hash: tokenHash(token), user_id: row.id, created_at: now.toISOString(), expires_at: new Date(now.getTime() + SESSION_SECONDS * 1000).toISOString() } })
    await tx.audit_log.create({ data: { id: randomUUID(), user_id: row.id, action: 'auth.login', target_id: row.id, details: '{}', created_at: now.toISOString() } })
  })
  ;(await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: SESSION_SECONDS })
}

export async function logout(request: Request) {
  assertSameOrigin(request)
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token) await prisma.sessions.deleteMany({ where: { token_hash: tokenHash(token) } })
  store.delete(SESSION_COOKIE)
}

export async function createUser(email: string, name: string, password: string, role: AdminUser['role']) {
  const normalized = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.length > 254 || !name.trim() || name.length > 100) throw new HttpError(400, 'Enter a valid email address and name.')
  const hash = await hashPassword(password)
  const id = randomUUID()
  const now = new Date().toISOString()
  try {
    await prisma.users.create({ data: { id, email: normalized, name: name.trim(), password_hash: hash, role, created_at: now, updated_at: now } })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') throw new HttpError(409, 'A user with this email address already exists.')
    throw error
  }
  return id
}
