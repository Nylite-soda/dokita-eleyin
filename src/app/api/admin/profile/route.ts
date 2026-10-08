import { apiError, assertSameOrigin, changePassword, requireStaff } from '@/lib/auth'
export async function PATCH(request:Request) {
  try{assertSameOrigin(request);const user=await requireStaff(),body=await request.json();await changePassword(user,body.currentPassword,body.newPassword);return Response.json({success:true})}
  catch(error){return apiError(error)}
}
