import { requirePageStaff } from '@/lib/auth'
import { listDocuments } from '@/lib/cms'
import { listMedia } from '@/lib/media'
import { getDefinition } from '@/lib/cms-definition'
import ContentManager from '@/components/admin/ContentManager'
export default async function ContentPage({ searchParams }: {searchParams:Promise<{type?:string}>}) {
  const user=await requirePageStaff(),{type}=await searchParams
  const initialType=type&&getDefinition(type)&&(!getDefinition(type)?.adminOnly||user.role==='admin')?type:'article'
  const [documents, media] = await Promise.all([listDocuments(), listMedia()])
  return <ContentManager initialDocuments={documents.filter(document=>user.role==='admin'||!getDefinition(document.type)?.adminOnly)} initialMedia={media} initialType={initialType} role={user.role}/>
}

