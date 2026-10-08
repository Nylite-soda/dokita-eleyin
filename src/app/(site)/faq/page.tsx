import type { Metadata } from 'next'
import { getFAQs } from '@/lib/content'
import FaqSection from '@/components/faq/FaqSection'
import EmptyState from '@/components/ui/EmptyState'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers about dókítà Eléyín, oral health consultations, programmes, outreach, and partnerships.',
}
export const revalidate = 60

export default async function FaqPage() {
  const faqs = await getFAQs('general')
  return <div className="min-h-screen bg-white px-6 pb-20 pt-32 md:px-12">
    {faqs.length ? <FaqSection faqs={faqs} title="Frequently Asked Questions" /> : <EmptyState title="Frequently Asked Questions" message="Answers to common questions will appear here soon." actionLabel="Contact the team" actionHref="/contact" />}
  </div>
}
