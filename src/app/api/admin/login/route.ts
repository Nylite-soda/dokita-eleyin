import { apiError, login } from '@/lib/auth'
export const runtime = 'nodejs'
export async function POST(request: Request) {
  try {
    const body = await request.json()
    await login(body.email, body.password, request)
    return Response.json({ success: true })
  } catch (error) { return apiError(error) }
}
