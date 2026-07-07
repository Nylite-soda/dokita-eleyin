// src/app/partnerships/page.tsx
import { Metadata } from 'next'
import { client } from '@/lib/sanity.client'
import { partnersQuery } from '@/lib/sanity.queries'
import SectionLabel from '@/components/ui/SectionLabel'
import PartnershipForm from '@/components/forms/PartnershipForm'
import SanityImage from '@/components/ui/SanityImage'
import { IconSchool, IconHeartHandshake, IconBuildingCommunity, IconCertificate, IconVolume, IconDeviceLaptop } from '@tabler/icons-react'
import { Partner } from '@/types'
import AnimateIn from '@/components/ui/AnimateIn'

export const metadata: Metadata = {
  title: 'Partner With Us | Dókítà Eléyín',
  description: 'Collaborate with Dókítà Eléyín to bring oral health education to schools, communities, and organizations.',
}

export const revalidate = 60

export default async function PartnershipsPage() {
  const partners: Partner[] = await client.fetch(partnersQuery)

  const opportunities = [
    { title: 'School Programs', icon: <IconSchool />, desc: 'Partner with us to bring dental education to your students.' },
    { title: 'Health Campaigns', icon: <IconHeartHandshake />, desc: 'Collaborate on community-wide oral health awareness.' },
    { title: 'Corporate Social Responsibility', icon: <IconBuildingCommunity />, desc: 'Support our mission through your CSR initiatives.' },
    { title: 'Content Collaboration', icon: <IconDeviceLaptop />, desc: 'Create evidence-based dental content together.' },
    { title: 'Speaking Engagements', icon: <IconVolume />, desc: 'Invite Dr. Ibukun to speak at your health events.' },
    { title: 'NGO Partnerships', icon: <IconCertificate />, desc: 'Join forces with us for larger humanitarian impact.' },
  ]

  return (
    <div className="pt-32 pb-16 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <AnimateIn direction="up" delay={0}>
          <div className="max-w-3xl mb-16">
            <span className="text-xs tracking-widest uppercase font-semibold text-brand-lightBlue block mb-3">Partner With Us</span>
            <h1 className="text-4xl lg:text-5xl font-display font-semibold text-ink leading-tight mb-4">
              Building a healthier future, together.
            </h1>
            <p className="text-lg text-ink-muted max-w-2xl leading-relaxed">
              We believe in the power of collaboration. Whether you're a school, a corporation, or a fellow NGO, let's join forces to simplify oral health.
            </p>
          </div>
        </AnimateIn>

        {/* Logo Grid */}
        {partners?.length > 0 && (
          <div className="mb-24 py-12 border-y border-brand-lightBlue/10">
            <h3 className="text-center font-display font-bold text-brand-navy/40 uppercase tracking-widest text-sm mb-12">Trusted By</h3>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all">
              {partners.map((p: Partner) => (
                <div key={p._id} className="h-12 w-32 relative">
                  <SanityImage asset={p.logo} alt={p.name} fill className="object-contain" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opportunity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {opportunities.map((opt, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-brand-lightBlue/5 hover:border-brand-lightBlue/20 transition-all group">
              <div className="w-12 h-12 bg-surface-soft text-brand-darkBlue rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-darkBlue group-hover:text-white transition-all">
                {opt.icon}
              </div>
              <h3 className="text-xl font-display font-bold text-brand-navy mb-3">{opt.title}</h3>
              <p className="text-ink/60 font-body leading-relaxed">{opt.desc}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Form Section */}
      <section className="bg-surface-soft py-16 px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-semibold text-ink mb-2">Partner With Us</h2>
          <p className="text-base text-ink-muted">
            Fill out the form and our team will get back to you within 48 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Left Column */}
          <div className="bg-white rounded-2xl border border-surface-card shadow-sm p-8">
            <span className="text-brand-lightBlue text-sm font-semibold uppercase tracking-widest block mb-3">Ready to collaborate?</span>
            <p className="text-base text-ink-muted leading-relaxed mb-8">
              Fill out the form and our team will get back to you within 48 hours to discuss how we can work together.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-brand-darkBlue font-semibold font-body">
                <span className="w-8 h-8 rounded-full bg-brand-lightBlue/10 text-brand-darkBlue font-bold flex items-center justify-center text-sm">1</span>
                Initial Discovery Call
              </div>
              <div className="flex items-center gap-3 text-brand-darkBlue font-semibold font-body">
                <span className="w-8 h-8 rounded-full bg-brand-lightBlue/10 text-brand-darkBlue font-bold flex items-center justify-center text-sm">2</span>
                Strategic Proposal
              </div>
              <div className="flex items-center gap-3 text-brand-darkBlue font-semibold font-body">
                <span className="w-8 h-8 rounded-full bg-brand-lightBlue/10 text-brand-darkBlue font-bold flex items-center justify-center text-sm">3</span>
                Implementation & Impact
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="bg-white rounded-2xl border border-surface-card shadow-sm p-8">
            <PartnershipForm />
          </div>
        </div>
      </section>
    </div>
  )
}

