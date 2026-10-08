import type { FAQ } from '@/types'
import RichText from '@/components/ui/RichText'

export default function FaqSection({ faqs, title = 'Frequently asked questions', className = '' }: { faqs: FAQ[]; title?: string; className?: string }) {
  if (!faqs.length) return null
  return <section aria-labelledby="faq-heading" className={`mx-auto max-w-3xl space-y-6 ${className}`}>
    <h2 id="faq-heading" className="text-display-sm text-center font-display text-brand-navy">{title}</h2>
    <div className="space-y-3">{faqs.map(faq => <details key={faq._id} className="motion-card faq-item rounded-2xl border border-brand-darkBlue/15 p-5">
      <summary className="cursor-pointer font-bold text-brand-navy focus-visible:outline-2 focus-visible:outline-brand-darkBlue">{faq.question}</summary>
      <RichText value={faq.answer} className="mt-4 text-base" />
    </details>)}</div>
  </section>
}
