// src/app/page.tsx
import { client } from '@/lib/sanity.client'
import { homepageQuery, impactPageQuery } from '@/lib/sanity.queries'
import Hero from '@/components/home/Hero'
import WhyWeExist from '@/components/home/WhyWeExist'
import ImpactTeaser from '@/components/home/ImpactTeaser'
import LatestArticles from '@/components/home/LatestArticles'
import SocialFeed from '@/components/home/SocialFeed'
import NewsletterBanner from '@/components/home/NewsletterBanner'

export const revalidate = 60

export default async function HomePage() {
  const [data, impactData] = await Promise.all([
    client.fetch(homepageQuery),
    client.fetch(impactPageQuery)
  ])
  
  return (
    <div className="flex flex-col">
      <Hero data={data} stats={impactData?.stats} />
      <WhyWeExist />
      <ImpactTeaser stats={impactData?.stats} />
      <LatestArticles articles={data?.featuredArticles} />
      <SocialFeed data={data} />
      <NewsletterBanner />
    </div>
  )
}
