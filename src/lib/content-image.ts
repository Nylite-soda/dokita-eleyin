import type { ImageObject } from '@/types'

/** Public images are served from our own persistent media library. */
export function getContentImageUrl(asset?: ImageObject | null): string | undefined {
  if (!asset) return undefined
  const source = asset.asset?.url
  if (source && /^\/(?:media|images)\/[a-zA-Z0-9_./-]+$/.test(source) && !source.includes('..')) return source
  const reference = asset.asset?._ref
  const match = reference?.match(/^local-([a-f0-9-]{36})$/)
  return match ? `/media/${match[1]}` : undefined
}
