import { redirect } from 'next/navigation'
import { requirePageStaff } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import UserManager from '@/components/admin/UserManager'
export default async function UsersPage(){const user=await requirePageStaff();if(user.role!=='admin')redirect('/admin');const rows=await prisma.users.findMany({select:{id:true,email:true,name:true,role:true,active:true},orderBy:{created_at:'asc'}});const users=rows.map(row=>({...row,role:row.role as 'admin'|'editor'}));return <UserManager initialUsers={users} currentId={user.id}/>}

