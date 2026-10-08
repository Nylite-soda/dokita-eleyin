import { apiError, assertSameOrigin, HttpError, requireAdmin } from '@/lib/auth'
import { getSubscribers } from '@/lib/communications'
import { getPrisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { csvResponse } from '@/lib/admin-csv'
export async function GET(request:Request) {
  try{
    await requireAdmin();const query=new URL(request.url).searchParams
    const subscribers=(await getSubscribers()).filter(row=>!query.get('status')||row.status===query.get('status'))
    if(query.get('export')==='csv')return csvResponse('subscribers.csv',['Email','Status','Consent recorded','Subscribed','Unsubscribed'],subscribers.map(row=>[row.email,row.status,row.consentedAt,row.createdAt,row.unsubscribedAt]))
    return Response.json({subscribers},{headers:{'Cache-Control':'private, no-store'}})
  }catch(error){return apiError(error)}
}
export async function PATCH(request:Request) {
  try{
    assertSameOrigin(request);const user=await requireAdmin(),body=await request.json()
    if(typeof body.id!=='string')throw new HttpError(400,'Choose a subscriber.')
    const now=new Date().toISOString(),result=await getPrisma().subscribers.updateMany({where:{id:body.id},data:{status:'unsubscribed',unsubscribed_at:now,updated_at:now}})
    if(!result.count)throw new HttpError(404,'Subscriber not found.')
    await logAudit(user.id,'subscriber.unsubscribe',body.id)
    return Response.json({success:true})
  }catch(error){return apiError(error)}
}
export async function DELETE(request:Request) {
  try{
    assertSameOrigin(request);const user=await requireAdmin(),body=await request.json()
    if(typeof body.id!=='string')throw new HttpError(400,'Choose a subscriber.')
    const result=await getPrisma().subscribers.deleteMany({where:{id:body.id}})
    if(!result.count)throw new HttpError(404,'Subscriber not found.')
    await logAudit(user.id,'subscriber.delete',body.id)
    return Response.json({success:true})
  }catch(error){return apiError(error)}
}
