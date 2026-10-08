import { requirePageStaff } from '@/lib/auth'
import { listMedia } from '@/lib/media'
import MediaManager from '@/components/admin/MediaManager'
export default async function MediaPage(){const user=await requirePageStaff();return <MediaManager initialMedia={await listMedia()} role={user.role}/>}

