import SectionLabel from '@/components/ui/SectionLabel'
import { HomepageSettings } from '@/types'
import { getSocialLinks } from '@/lib/social'

export default function SocialFeed({ data }: { data?: HomepageSettings | null }) {
  const socials = getSocialLinks(data?.socialLinks)
  if (!socials.length) return null
  return <section className="py-16 bg-white"><div className="max-w-6xl mx-auto px-6 text-center"><SectionLabel>Follow Along</SectionLabel><h2 className="text-display-sm font-display text-brand-navy mb-6">Join our community</h2><div className="flex flex-wrap justify-center gap-6">{socials.map(social => <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="text-brand-darkBlue font-semibold underline underline-offset-4">{social.label}<span className="sr-only"> (opens in a new tab)</span></a>)}</div></div></section>
}
