export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter'
export type SocialHandles = Partial<Record<SocialPlatform, string>>

const platforms = {
  instagram: { label: 'Instagram', host: 'instagram.com', prefix: '' },
  tiktok: { label: 'TikTok', host: 'tiktok.com', prefix: '@' },
  youtube: { label: 'YouTube', host: 'youtube.com', prefix: '@' },
  linkedin: { label: 'LinkedIn', host: 'linkedin.com', prefix: 'in/' },
  twitter: { label: 'X', host: 'x.com', prefix: '' },
} satisfies Record<SocialPlatform, { label: string; host: string; prefix: string }>

/** Editors can supply a handle or a complete URL for the selected platform. */
export function normalizeSocialUrl(platform: SocialPlatform, value?: string): string | undefined {
  const input = value?.trim()
  if (!input) return undefined
  const { host, prefix } = platforms[platform]

  if (/^(?:https?:\/\/|\/\/|(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}\/)/i.test(input)) {
    try {
      const url = new URL(input.startsWith('//') ? `https:${input}` : /^https?:\/\//i.test(input) ? input : `https://${input}`)
      const hostname = url.hostname.replace(/^www\./, '')
      const allowedHosts = platform === 'twitter' ? ['twitter.com', 'x.com'] : [host]
      if (!allowedHosts.includes(hostname) || url.username || url.password || !/^https?:$/.test(url.protocol)) return undefined
      url.protocol = 'https:'
      return url.href
    } catch {
      return undefined
    }
  }

  const handle = input.replace(/^@/, '').replace(/^\/+|\/+$/g, '')
  if (!/^[a-zA-Z0-9_.-]+$/.test(handle)) return undefined
  return `https://www.${host}/${prefix}${encodeURIComponent(handle)}`
}

export function getSocialLinks(handles?: SocialHandles) {
  return (Object.keys(platforms) as SocialPlatform[]).flatMap((platform) => {
    const url = normalizeSocialUrl(platform, handles?.[platform])
    return url ? [{ platform, label: platforms[platform].label, url }] : []
  })
}
