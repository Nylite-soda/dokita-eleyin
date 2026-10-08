import { requirePageAdmin } from '@/lib/auth'
import { getSubscribers } from '@/lib/communications'
import SubscriberManager from '@/components/admin/SubscriberManager'
export default async function SubscribersPage(){await requirePageAdmin();return <SubscriberManager initialSubscribers={await getSubscribers()}/>} 
