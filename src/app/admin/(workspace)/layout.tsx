import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { LogoutButton } from '@/components/admin/AuthControls'
export const dynamic = 'force-dynamic'
export default async function WorkspaceLayout({ children }: {children:React.ReactNode}) {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/login')
  return <><header className="admin-header"><Link href="/admin" className="font-display text-xl font-semibold">Dókítà Eléyín Admin</Link><div className="flex items-center gap-4"><span>{user.name} · {user.role}</span><LogoutButton/></div></header><nav className="admin-nav" aria-label="Administration"><Link href="/admin">Overview</Link><Link href="/admin/content">Content</Link><Link href="/admin/media">Media</Link><Link href="/admin/profile">Your account</Link>{user.role==='admin'&&<><Link href="/admin/settings">Settings</Link><Link href="/admin/bookings">Bookings</Link><Link href="/admin/services">Services</Link><Link href="/admin/availability">Availability</Link><Link href="/admin/users">Users</Link></>}<Link href="/" target="_blank" rel="noopener noreferrer">View website ↗</Link></nav><main className="admin-main">{children}</main></>
}

