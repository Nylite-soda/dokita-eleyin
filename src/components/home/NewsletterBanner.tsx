// src/components/home/NewsletterBanner.tsx
import NewsletterForm from '@/components/forms/NewsletterForm'

interface NewsletterBannerProps {
  data?: any
}

export default function NewsletterBanner({ data }: NewsletterBannerProps) {
  return (
    <section className="py-20 bg-brand-darkBlue relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-lightBlue/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-cyan/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10 text-center">
        <h2 className="text-display-sm md:text-display-md font-display text-white mb-4">
          {data?.newsletterHeadline || "Get dental tips straight to your inbox."}
        </h2>
        <p className="text-lg text-blue-100/70 font-body mb-10 max-w-xl mx-auto">
          {data?.newsletterSubcopy || "Join our community of 2,000+ subscribers and receive simple, actionable oral health advice once a month."}
        </p>
        <div className="flex justify-center">
          <NewsletterForm />
        </div>
      </div>
    </section>
  )
}

