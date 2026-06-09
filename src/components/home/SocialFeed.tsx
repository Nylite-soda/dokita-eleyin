// src/components/home/SocialFeed.tsx
'use client'
import SectionLabel from '@/components/ui/SectionLabel'
import { IconBrandInstagram, IconBrandTiktok, IconBrandYoutube } from '@tabler/icons-react'

interface SocialFeedProps {
  data?: any
}

export default function SocialFeed({ data }: SocialFeedProps) {
  const socialLinks = data?.socialLinks || {}
  
  return (
    <section className="py-24 bg-white relative">
      {/* Wavy top border */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none transform -translate-y-[99%]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-20 fill-white">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-4 mb-12">
          <SectionLabel>Follow Along</SectionLabel>
          <h2 className="text-display-md font-display text-brand-navy">Join our community</h2>
          <div className="flex justify-center gap-6 pt-4">
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener" className="flex items-center gap-2 text-brand-darkBlue font-bold font-body hover:text-brand-lightBlue transition-all">
                <IconBrandInstagram /> Instagram
              </a>
            )}
            {socialLinks.tiktok && (
              <a href={socialLinks.tiktok} target="_blank" rel="noopener" className="flex items-center gap-2 text-brand-darkBlue font-bold font-body hover:text-brand-lightBlue transition-all">
                <IconBrandTiktok /> TikTok
              </a>
            )}
            {socialLinks.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noopener" className="flex items-center gap-2 text-brand-darkBlue font-bold font-body hover:text-brand-lightBlue transition-all">
                <IconBrandYoutube /> YouTube
              </a>
            )}
          </div>
        </div>

        {/* Dynamic Social Feed Grid */}
        <div className="min-h-[400px]">
          {data?.socialFeedEmbed ? (
            <div 
              className="w-full"
              dangerouslySetInnerHTML={{ __html: data.socialFeedEmbed }} 
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="aspect-square bg-surface-soft rounded-3xl border border-brand-lightBlue/10 flex flex-col items-center justify-center text-brand-darkBlue/20 p-8">
                  <IconBrandInstagram size={48} className="mb-4 opacity-20" />
                  <p className="text-xs font-body font-semibold opacity-40 uppercase tracking-widest">Post Preview</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
