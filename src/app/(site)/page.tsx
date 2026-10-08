// src/app/page.tsx
import { getHomepage, getImpact } from '@/lib/content'
import Hero from '@/components/home/Hero'
import WhyWeExist from '@/components/home/WhyWeExist'
import ImpactTeaser from '@/components/home/ImpactTeaser'
import LatestArticles from '@/components/home/LatestArticles'
import NewsletterBanner from '@/components/home/NewsletterBanner'
import AnimateIn from '@/components/ui/AnimateIn'

export const revalidate = 60

export default async function HomePage() {
  const [data, impactData] = await Promise.all([
    getHomepage(),
    getImpact()
  ])
  
  return (
    <div className="flex flex-col overflow-hidden">
      <AnimateIn direction="left" delay={0}>
        <Hero data={data} />
      </AnimateIn>
      <AnimateIn direction="up" delay={0}>
        <WhyWeExist data={data} />
      </AnimateIn>
      <AnimateIn direction="up" delay={0}>
        <ImpactTeaser stats={impactData?.stats} />
      </AnimateIn>
      {!!data?.featuredArticles?.length && <AnimateIn direction="right" delay={0}>
        <LatestArticles articles={data?.featuredArticles} />
      </AnimateIn>}
      <AnimateIn direction="up" delay={0}>
        <NewsletterBanner data={data} />
      </AnimateIn>
    </div>
  )
}

