import { requirePageStaff } from '@/lib/auth'
import PasswordForm from '@/components/admin/PasswordForm'
export default async function ProfilePage(){const user=await requirePageStaff();return <><h1>Your account</h1><p>{user.name} · {user.email}</p><PasswordForm/></>}
