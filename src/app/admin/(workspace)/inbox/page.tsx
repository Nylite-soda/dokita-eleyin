import { requirePageAdmin } from '@/lib/auth'
import { getInquiries } from '@/lib/communications'
import InboxManager from '@/components/admin/InboxManager'
export default async function InboxPage(){await requirePageAdmin();return <InboxManager initialInquiries={await getInquiries()}/>} 
