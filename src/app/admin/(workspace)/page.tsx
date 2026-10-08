import Link from 'next/link'
import { requirePageStaff } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CMS_DEFINITIONS } from '@/lib/cms-definition'

export default async function AdminPage() {
  const user = await requirePageStaff()
  const [counts, audit] = await Promise.all([
    prisma.cms_documents.groupBy({ by: ['type', 'status'], _count: { _all: true } }),
    user.role === 'admin' ? prisma.audit_log.findMany({ select: { action: true, created_at: true, users: { select: { name: true } } }, orderBy: { created_at: 'desc' }, take: 12 }) : Promise.resolve([]),
  ])
  const countFor = (type: string, status: string) => counts.find(row => row.type === type && row.status === status)?._count._all ?? 0
  return <>
    <h1>Welcome, {user.name}</h1>
    <p className="admin-muted">Draft changes stay private until an administrator reviews and publishes them.</p>
    <div className="admin-grid">{CMS_DEFINITIONS.filter(type => !type.adminOnly || user.role === 'admin').map(type => <Link className="admin-panel" key={type.type} href={type.type === 'siteSettings' ? '/admin/settings' : `/admin/content?type=${type.type}`}>
      <h2>{type.label}</h2><p>{countFor(type.type, 'published')} published · {countFor(type.type, 'draft')} drafts</p>
    </Link>)}</div>
    {user.role === 'admin' && <section className="admin-panel"><h2>Recent activity</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Action</th><th>User</th><th>Time</th></tr></thead><tbody>{audit.map((row, index) => <tr key={index}><td>{row.action}</td><td>{row.users?.name || 'System'}</td><td>{new Date(row.created_at).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}</td></tr>)}</tbody></table></div>{!audit.length && <p>No activity yet.</p>}</section>}
  </>
}
