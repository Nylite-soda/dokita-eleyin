import Link from 'next/link'
import { getFounder } from '@/lib/content'
import { getSocialLinks } from '@/lib/social'
import { pageMetadata } from '@/lib/seo'
import SectionLabel from '@/components/ui/SectionLabel'
import RichText from '@/components/ui/RichText'
import ContentImage from '@/components/ui/ContentImage'
import EmptyState from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export const metadata = pageMetadata({ title: 'Meet the Founder', description: 'Meet the founder of Dókítà Eléyín and learn about the purpose behind our oral health education.', path: '/founder' })
export const revalidate = 60

export default async function FounderPage() {
  const founder = await getFounder()
  if (!founder) return <div className="pt-32 pb-16"><EmptyState title="Meet the team" message="The founder profile has not been published yet. Our team can answer questions about our work and consultation options." actionLabel="Contact the team" actionHref="/contact" /></div>
  const socials = getSocialLinks(founder.socialLinks)
  const hasBio = !!founder.bio?.length || !!founder.shortBio

  return (
    <div className="pt-32 pb-16 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <section className={`grid gap-10 items-center ${founder.photo ? 'lg:grid-cols-2' : 'max-w-3xl'}`}>
          <div className="space-y-6">
            <SectionLabel>Meet the Founder</SectionLabel>
            <h1 className="text-display-md font-display text-brand-navy leading-tight">{founder.fullName}</h1>
            {!!founder.credentials?.length && <ul className="flex flex-wrap gap-2" aria-label="Qualifications">{founder.credentials.map(credential => <li key={credential} className="bg-surface-soft text-brand-darkBlue px-4 py-2 rounded-full text-sm font-semibold">{credential}</li>)}</ul>}
            {founder.shortBio && <p className="text-lg text-ink-muted leading-relaxed">{founder.shortBio}</p>}
            {founder.featuredQuote && <blockquote className="border-l-4 border-brand-darkBlue pl-5 text-xl font-display text-brand-navy leading-relaxed">{founder.featuredQuote}</blockquote>}
            <Button asChild><Link href="/contact">Contact the team</Link></Button>
          </div>
          {founder.photo && <ContentImage asset={founder.photo} alt={founder.photo.alt || founder.fullName} width={600} height={750} className="rounded-3xl max-w-md" imageClassName="object-top" sizes="(max-width: 1024px) 100vw, 40vw" loading="eager" />}
        </section>
        {!!founder.bio?.length && <section className="mt-12 max-w-3xl"><h2 className="text-2xl font-display text-brand-navy mb-6">About {founder.fullName}</h2><RichText value={founder.bio} /></section>}
        {!hasBio && <p className="mt-8 max-w-2xl text-ink-muted leading-relaxed">For information about the founder&apos;s work or speaking enquiries, please contact the team.</p>}
        {!!socials.length && <section className="mt-10"><h2 className="text-xl font-display font-semibold text-brand-navy mb-4">Connect with {founder.fullName}</h2><div className="flex flex-wrap gap-4">{socials.map(social => <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="text-brand-darkBlue font-semibold underline underline-offset-4">{social.label}<span className="sr-only"> (opens in a new tab)</span></a>)}</div></section>}
      </div>
    </div>
  )
}
