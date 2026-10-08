'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter(), [busy,setBusy] = useState(false), [error,setError] = useState('')
  async function logout() {
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/admin/logout', { method:'POST' })
      if (!response.ok) throw new Error('Sign out failed. Please retry.')
      router.replace('/admin/login'); router.refresh()
    } catch (error) { setError(error instanceof Error ? error.message : 'Sign out failed.') }
    finally { setBusy(false) }
  }
  return <div><button type="button" className="admin-button-secondary" disabled={busy} onClick={logout}>{busy?'Signing out…':'Sign out'}</button>{error&&<p role="alert">{error}</p>}</div>
}
export function LoginForm() {
  const router = useRouter(), [busy,setBusy] = useState(false), [error,setError] = useState('')
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.get('email'),password:form.get('password')})})
      const data: { error?:string } = await response.json()
      if (!response.ok) throw new Error(data.error||'Sign in failed.')
      router.replace('/admin'); router.refresh()
    } catch (error) { setError(error instanceof Error?error.message:'Sign in failed. Please try again.') }
    finally { setBusy(false) }
  }
  return <form onSubmit={submit} className="admin-panel"><div className="admin-field"><label htmlFor="admin-email">Email address</label><input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={254}/></div><div className="admin-field"><label htmlFor="admin-password">Password</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={128}/></div>{error&&<p className="admin-error" role="alert">{error}</p>}<button className="admin-button" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form>
}
