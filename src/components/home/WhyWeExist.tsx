// src/components/home/WhyWeExist.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import { IconBook, IconShieldCheck, IconHeart } from '@tabler/icons-react'

interface WhyWeExistProps {
  data?: any
}

export default function WhyWeExist({ data }: WhyWeExistProps) {
  const values = [
    {
      icon: <IconBook className="w-8 h-8 text-brand-lightBlue" />,
      title: "Education",
      desc: "Simplifying complex dental concepts for everyone."
    },
    {
      icon: <IconShieldCheck className="w-8 h-8 text-brand-lightBlue" />,
      title: "Prevention",
      desc: "Empowering communities to stop issues before they start."
    },
    {
      icon: <IconHeart className="w-8 h-8 text-brand-lightBlue" />,
      title: "Accessibility",
      desc: "Bringing oral health care knowledge to your doorstep."
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <SectionLabel>Our Purpose</SectionLabel>
            <h2 className="text-display-md font-display text-brand-navy leading-tight">
              {data?.whyWeExistTitle || "Making oral health knowledge simple, accessible, and actionable."}
            </h2>
            <p className="text-lg text-ink/70 font-body leading-relaxed max-w-xl">
              {data?.whyWeExistBody || "We believe that every individual deserves the knowledge and tools to maintain a healthy smile. Through community engagement and clear education, we're building a future where oral health is a priority, not an afterthought."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {values.map((v, i) => (
              <div key={i} className="flex items-start gap-6 p-8 rounded-3xl bg-surface-soft border border-brand-lightBlue/10 hover:border-brand-lightBlue/30 transition-all">
                <div className="shrink-0">{v.icon}</div>
                <div>
                  <h3 className="text-xl font-display font-bold text-brand-navy mb-1">{v.title}</h3>
                  <p className="text-ink/60 font-body">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
