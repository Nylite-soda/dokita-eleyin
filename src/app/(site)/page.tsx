// src/app/page.tsx
import { client } from '@/lib/sanity.client'
import { homepageQuery, impactPageQuery } from '@/lib/sanity.queries'
import Hero from '@/components/home/Hero'
import WhyWeExist from '@/components/home/WhyWeExist'
import ImpactTeaser from '@/components/home/ImpactTeaser'
import LatestArticles from '@/components/home/LatestArticles'
import SocialFeed from '@/components/home/SocialFeed'
import NewsletterBanner from '@/components/home/NewsletterBanner'
import AnimateIn from '@/components/ui/AnimateIn'

export const revalidate = 60

export default async function HomePage() {
  const [data, impactData] = await Promise.all([
    client.fetch(homepageQuery),
    client.fetch(impactPageQuery)
  ])
  
  return (
    <div className="flex flex-col overflow-hidden">
      <AnimateIn direction="left" delay={0}>
        <Hero data={data} stats={impactData?.stats} />
      </AnimateIn>
      <AnimateIn direction="up" delay={0}>
        <WhyWeExist data={data} />
      </AnimateIn>
      <AnimateIn direction="up" delay={0}>
        <ImpactTeaser stats={impactData?.stats} />
      </AnimateIn>
      <AnimateIn direction="right" delay={0}>
        <LatestArticles articles={data?.featuredArticles} />
      </AnimateIn>
      {/* TODO: Uncomment when Instagram/TikTok embed API is connected */}
      {/* <SocialFeed data={data} /> */}
      <AnimateIn direction="up" delay={0}>
        <NewsletterBanner data={data} />
      </AnimateIn>
    </div>
  )
}

