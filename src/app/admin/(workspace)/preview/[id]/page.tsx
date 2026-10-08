import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { requirePageStaff } from '@/lib/auth'
import { getDocument } from '@/lib/cms'
import { getDefinition,getFieldValue,paragraphText } from '@/lib/cms-definition'
export default async function PreviewPage({params}:{params:Promise<{id:string}>}){
  const user=await requirePageStaff(),{id}=await params,document=await getDocument(id)
  if(!document)notFound()
  const definition=getDefinition(document.type)
  if(!definition||(definition.adminOnly&&user.role!=='admin'))notFound()
  return <><h1>Draft preview</h1><p className="admin-notice">This saved draft is visible only to signed-in staff. It has not been published.</p><Link href={`/admin/content?type=${document.type}`} className="admin-button-secondary">Back to editor</Link><article className="admin-panel"><h2>{String(document.data.title||document.data.name||document.data.fullName||document.data.question||definition.singular)}</h2>{definition.fields.map(field=>{const value=getFieldValue(document.data,field.key);if(value===undefined||value===null||value==='')return null;if(field.kind==='richtext')return <section key={field.key} className="mb-6"><h3 className="font-semibold mb-2">{field.label}</h3>{paragraphText(value).split('\n\n').map((text,index)=><p key={index} className="mb-4 whitespace-pre-wrap leading-relaxed">{text}</p>)}</section>;if(field.kind==='image'){const image=value as {asset?:{url?:string};alt?:string};return image.asset?.url?.startsWith('/media/')?<Image key={field.key} src={image.asset.url} alt={image.alt||field.label} width={720} height={480} className="mb-6 max-h-96 w-full object-contain" unoptimized/>:null}return <section key={field.key} className="mb-4"><h3 className="font-semibold">{field.label}</h3><p className="whitespace-pre-wrap break-words">{typeof value==='object'?JSON.stringify(value,null,2):String(value)}</p></section>})}</article></>
}
