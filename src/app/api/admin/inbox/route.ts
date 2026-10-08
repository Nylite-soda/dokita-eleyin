import { apiError, assertSameOrigin, HttpError, requireAdmin } from '@/lib/auth'
import { getInquiries } from '@/lib/communications'
import { getPrisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { csvResponse } from '@/lib/admin-csv'
export async function GET(request:Request) {
  try{
    await requireAdmin();const query=new URL(request.url).searchParams
    const inquiries=(await getInquiries()).filter(row=>(!query.get('status')||row.status===query.get('status'))&&(!query.get('kind')||row.kind===query.get('kind')))
    if(query.get('export')==='csv')return csvResponse('inquiries.csv',['ID','Type','Name','Email','Phone','Organization','Subject','Message','Interests','Status','Received'],inquiries.map(row=>[row.id,row.kind,row.name,row.email,row.phone,row.organizationName,row.subject,row.message,row.interest.join('; '),row.status,row.createdAt]))
    return Response.json({inquiries},{headers:{'Cache-Control':'private, no-store'}})
  }catch(error){return apiError(error)}
}
export async function PATCH(request:Request) {
  try{
    assertSameOrigin(request);const user=await requireAdmin(),body=await request.json()
    if(typeof body.id!=='string'||!['new','read','archived'].includes(body.status))throw new HttpError(400,'Choose a valid inquiry and status.')
    const result=await getPrisma().inquiries.updateMany({where:{id:body.id},data:{status:body.status,updated_at:new Date().toISOString()}})
    if(!result.count)throw new HttpError(404,'Inquiry not found.')
    await logAudit(user.id,`inquiry.${body.status}`,body.id)
    return Response.json({success:true})
  }catch(error){return apiError(error)}
}
