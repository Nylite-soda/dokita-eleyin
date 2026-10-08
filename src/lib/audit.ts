import 'server-only'
import { randomUUID } from 'node:crypto'
import { getPrisma } from '@/lib/prisma'

export async function logAudit(userId: string | null, action: string, targetId?: string | null, details: Record<string, unknown> = {}) {
  await getPrisma().audit_log.create({
    data: {
      id: randomUUID(),
      user_id: userId,
      action,
      target_id: targetId ?? null,
      details: JSON.stringify(details),
      created_at: new Date().toISOString(),
    },
  })
}
