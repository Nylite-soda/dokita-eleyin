// src/app/founder/page.tsx
import { client } from '@/lib/sanity.client'
import { founderQuery } from '@/lib/sanity.queries'
import SectionLabel from '@/components/ui/SectionLabel'
import RichText from '@/components/ui/RichText'
import SanityImage from '@/components/ui/SanityImage'
import { IconBrandInstagram, IconBrandTiktok, IconBrandLinkedin, IconBrandTwitter } from '@tabler/icons-react'
import { Founder } from '@/types'

export const revalidate = 60

export default async function FounderPage() {
  const founder: Founder = await client.fetch(founderQuery)

  if (!founder) return <div className="pt-40 text-center">Founder information not available.</div>

  const socialIcons: Record<string, React.ReactNode> = {
    instagram: <IconBrandInstagram />,
    tiktok: <IconBrandTiktok />,
    linkedin: <IconBrandLinkedin />,
    twitter: <IconBrandTwitter />,
  }

  return (
    <div className="pt-20">
      {/* Hero Portrait */}
      <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
        <SanityImage 
          asset={founder.photo} 
          alt={founder.fullName}
          fill
          className="object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-display-lg md:text-display-xl font-display text-white mb-4">
              {founder.fullName}
            </h1>
            <div className="flex flex-wrap gap-3">
              {founder.credentials?.map((c: string, i: number) => (
                <span key={i} className="bg-brand-lightBlue text-brand-navy px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              <SectionLabel className="mb-6">About the Founder</SectionLabel>
              <div className="prose prose-xl font-body text-ink/80">
                <RichText value={founder.bio} />
              </div>
            </div>
            
            <div className="lg:col-span-4 space-y-12">
              {/* Featured Quote */}
              {founder.featuredQuote && (
                <div className="bg-surface-soft p-10 rounded-[2.5rem] relative">
                  <span className="text-8xl font-display text-brand-lightBlue/20 absolute top-4 left-4">"</span>
                  <p className="text-xl font-display font-medium text-brand-navy italic relative z-10">
                    {founder.featuredQuote}
                  </p>
                </div>
              )}

              {/* Social Links */}
              <div className="space-y-6">
                <h3 className="font-display text-xl font-bold text-brand-navy">Connect with Dr. Ibukun</h3>
                <div className="flex gap-4">
                  {(Object.entries(founder.socialLinks || {}) as [string, string][]).map(([platform, url]) => (
                    url && (
                      <a 
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-2xl bg-brand-darkBlue text-white flex items-center justify-center hover:bg-brand-lightBlue hover:text-brand-navy transition-all"
                      >
                        {socialIcons[platform]}
                      </a>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
