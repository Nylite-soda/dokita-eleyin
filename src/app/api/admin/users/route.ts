import { apiError, assertSameOrigin, createUser, hashPassword, HttpError, requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'node:crypto'
export async function GET() {
  try { await requireAdmin(); return Response.json({ users: await prisma.users.findMany({ select: { id: true, email: true, name: true, role: true, active: true, created_at: true }, orderBy: { created_at: 'asc' } }) }, { headers: { 'Cache-Control': 'private, no-store' } }) }
  catch (error) { return apiError(error) }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const user = await requireAdmin(), body = await request.json()
    if (!['admin','editor'].includes(body.role) || typeof body.email !== 'string' || typeof body.name !== 'string' || typeof body.password !== 'string') throw new HttpError(400, 'Enter valid user details.')
    const id = await createUser(body.email, body.name, body.password, body.role)
    await prisma.audit_log.create({ data: { id: randomUUID(), user_id: user.id, action: 'user.create', target_id: id, details: JSON.stringify({ role: body.role }), created_at: new Date().toISOString() } })
    return Response.json({ id }, { status: 201 })
  } catch (error) { return apiError(error) }
}
export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request)
    const user = await requireAdmin(), body = await request.json()
    if (typeof body.id !== 'string') throw new HttpError(400, 'Choose a user.')
    const newHash = body.password ? await hashPassword(body.password) : undefined
    await prisma.$transaction(async tx => {
      const target = await tx.users.findUnique({ where: { id: body.id } })
      if (!target) throw new HttpError(404, 'User not found.')
      const role = body.role ?? target.role, active = body.active === undefined ? target.active : body.active ? 1 : 0
      if (!['admin','editor'].includes(String(role))) throw new HttpError(400, 'Choose a valid role.')
      if (target.role === 'admin' && target.active === 1 && (role !== 'admin' || active !== 1)) {
        const count = await tx.users.count({ where: { role: 'admin', active: 1 } })
        if (count < 2) throw new HttpError(409, 'Keep at least one active administrator.')
      }
      const now = new Date().toISOString()
      await tx.users.update({ where: { id: body.id }, data: { role: String(role), active: Number(active), password_hash: newHash || target.password_hash, updated_at: now } })
      await tx.sessions.deleteMany({ where: { user_id: body.id } })
      await tx.audit_log.create({ data: { id: randomUUID(), user_id: user.id, action: 'user.update', target_id: body.id, details: JSON.stringify({ role, active, passwordReset: Boolean(newHash) }), created_at: now } })
    })
    return Response.json({ success: true })
  } catch (error) { return apiError(error) }
}
