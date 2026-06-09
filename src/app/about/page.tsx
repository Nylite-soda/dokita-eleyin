// src/app/about/page.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import { client } from '@/lib/sanity.client'
import { siteSettingsQuery } from '@/lib/sanity.queries'
import { IconTarget, IconEye, IconStars, IconMessageHeart, IconShieldHeart, IconUsers } from '@tabler/icons-react'

export const revalidate = 60

export default async function AboutPage() {
  const settings = await client.fetch(siteSettingsQuery)
  
  const iconMap: Record<string, any> = {
    'Empathy': <IconMessageHeart />,
    'Excellence': <IconStars />,
    'Inclusion': <IconUsers />,
    'Integrity': <IconShieldHeart />,
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <SectionLabel>Our Story</SectionLabel>
            <h1 className="text-display-md md:text-display-lg font-display text-brand-navy leading-tight">
              {settings?.siteTagline || 'Bridging the gap in oral health education.'}
            </h1>
            <p className="text-xl text-ink/70 font-body leading-relaxed">
              {settings?.footerDescription || 'Dókítà Eléyín was born from a simple observation: oral health knowledge is often trapped in clinical settings, making it feel complex and inaccessible.'}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-surface-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-12 rounded-[2.5rem] space-y-6 shadow-sm border border-brand-lightBlue/5">
              <div className="w-12 h-12 bg-brand-lightBlue/10 text-brand-darkBlue rounded-2xl flex items-center justify-center">
                <IconTarget size={28} />
              </div>
              <h2 className="text-2xl font-display font-bold text-brand-navy">Our Mission</h2>
              <p className="text-ink/60 font-body leading-relaxed">
                {settings?.mission || 'To simplify oral health education through community engagement, digital outreach, and school-led initiatives.'}
              </p>
            </div>
            <div className="bg-white p-12 rounded-[2.5rem] space-y-6 shadow-sm border border-brand-lightBlue/5">
              <div className="w-12 h-12 bg-brand-cyan/10 text-brand-navy rounded-2xl flex items-center justify-center">
                <IconEye size={28} />
              </div>
              <h2 className="text-2xl font-display font-bold text-brand-navy">Our Vision</h2>
              <p className="text-ink/60 font-body leading-relaxed">
                {settings?.vision || 'A world where preventable dental diseases are a thing of the past, and every community has the knowledge to maintain healthy smiles.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <SectionLabel>What Drives Us</SectionLabel>
            <h2 className="text-display-sm font-display text-brand-navy">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v: any, i: number) => (
              <div key={i} className="text-center space-y-4 p-8 rounded-3xl hover:bg-surface-soft transition-colors border border-transparent hover:border-brand-lightBlue/10">
                <div className="w-12 h-12 mx-auto text-brand-lightBlue">
                  {iconMap[v.title] || <IconStars />}
                </div>
                <h3 className="text-xl font-display font-bold text-brand-navy">{v.title}</h3>
                <p className="text-sm text-ink/60 font-body leading-relaxed">{v.description || v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}