import { redirect } from 'next/navigation'
import { requirePageStaff } from '@/lib/auth'
import { listDocuments } from '@/lib/cms'
import { listMedia } from '@/lib/media'
import ContentManager from '@/components/admin/ContentManager'
export default async function SettingsPage() {
  const user=await requirePageStaff()
  if(user.role!=='admin')redirect('/admin')
  const [documents, media] = await Promise.all([listDocuments(), listMedia()])
  return <ContentManager initialDocuments={documents} initialMedia={media} initialType="siteSettings" role={user.role}/>
}

