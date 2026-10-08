import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { LoginForm } from '@/components/admin/AuthControls'
export default async function LoginPage() {
  if (await getCurrentUser()) redirect('/admin')
  return <main className="admin-main" style={{maxWidth:'32rem',paddingTop:'4rem'}}><h1>Dókítà Eléyín Admin</h1><p className="admin-muted">Sign in to manage your content and appointments.</p><LoginForm/><Link href="/" className="admin-button-secondary">Return to website</Link></main>
}
