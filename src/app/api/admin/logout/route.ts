import { apiError, logout } from '@/lib/auth'
export async function POST(request: Request) {
  try { await logout(request); return Response.json({ success: true }) }
  catch (error) { return apiError(error) }
}
