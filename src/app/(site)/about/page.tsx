// src/app/about/page.tsx
import { Metadata } from 'next'
import SectionLabel from '@/components/ui/SectionLabel'
import { client } from '@/lib/sanity.client'
import { siteSettingsQuery } from '@/lib/sanity.queries'
import { IconTarget, IconEye, IconStars, IconMessageHeart, IconShieldHeart, IconUsers } from '@tabler/icons-react'
import AnimateIn from '@/components/ui/AnimateIn'

export const metadata: Metadata = {
  title: 'About Us | Dókítà Eléyín',
  description: 'Learn about Dókítà Eléyín — a platform dedicated to oral health education, advocacy, and community impact across Nigeria and beyond.',
}

export const revalidate = 60

export default async function AboutPage() {
  const settings = await client.fetch(siteSettingsQuery)
  
  const iconMap: Record<string, any> = {
    'Empathy': <IconMessageHeart size={20} className="text-brand-darkBlue" />,
    'Excellence': <IconStars size={20} className="text-brand-darkBlue" />,
    'Inclusion': <IconUsers size={20} className="text-brand-darkBlue" />,
    'Integrity': <IconShieldHeart size={20} className="text-brand-darkBlue" />,
  }

  const defaultValues = [
    { title: "Empathy", description: "We listen first, understanding the unique needs of every community member." },
    { title: "Excellence", description: "We are committed to the highest standards of dental education and guidance." },
    { title: "Inclusion", description: "Oral health is for everyone, regardless of age, background, or location." },
    { title: "Integrity", description: "Clear, honest, and evidence-based information is at the heart of what we do." },
  ]

  const values = settings?.coreValues || defaultValues

  return (
    <div className="pt-32 flex flex-col">
      {/* Hero */}
      <section className="pt-12 pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <AnimateIn direction="up" delay={0}>
            <div className="max-w-3xl">
              <span className="text-xs tracking-widest uppercase font-semibold text-brand-lightBlue block mb-3">Our Story</span>
              <h1 className="text-4xl lg:text-5xl font-display font-semibold text-ink leading-tight mb-4">
                {settings?.siteTagline || 'Bridging the gap in oral health education.'}
              </h1>
              <p className="text-lg text-ink-muted max-w-2xl leading-relaxed">
                {settings?.footerDescription || 'Dókítà Eléyín was born from a simple observation: oral health knowledge is often trapped in clinical settings, making it feel complex and inaccessible.'}
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-surface-soft">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-surface-soft p-8 rounded-2xl space-y-6 border border-brand-lightBlue/20">
              <div className="h-1 w-12 bg-brand-lightBlue rounded-full" />
              <div className="w-12 h-12 bg-brand-lightBlue/10 text-brand-lightBlue rounded-2xl flex items-center justify-center">
                <IconTarget size={28} />
              </div>
              <h2 className="text-xl font-display font-semibold text-ink">Our Mission</h2>
              <p className="text-base text-ink-muted leading-relaxed">
                {settings?.mission || 'To simplify oral health education through community engagement, digital outreach, and school-led initiatives.'}
              </p>
            </div>
            <div className="bg-surface-soft p-8 rounded-2xl space-y-6 border border-brand-lightBlue/20">
              <div className="h-1 w-12 bg-brand-lightBlue rounded-full" />
              <div className="w-12 h-12 bg-brand-lightBlue/10 text-brand-lightBlue rounded-2xl flex items-center justify-center">
                <IconEye size={28} />
              </div>
              <h2 className="text-xl font-display font-semibold text-ink">Our Vision</h2>
              <p className="text-base text-ink-muted leading-relaxed">
                {settings?.vision || 'A world where preventable dental diseases are a thing of the past, and every community has the knowledge to maintain healthy smiles.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-surface-soft py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs tracking-widest uppercase font-semibold text-brand-lightBlue block mb-3">WHAT DRIVES US</span>
            <h2 className="font-display text-3xl font-semibold text-ink">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v: any, i: number) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-surface-card shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-start text-left">
                <div className="w-10 h-10 rounded-full bg-brand-lightBlue/10 flex items-center justify-center">
                  {iconMap[v.title] || <IconStars size={20} className="text-brand-darkBlue" />}
                </div>
                <h3 className="font-display font-semibold text-lg text-ink mt-4 mb-2">{v.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{v.description || v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
