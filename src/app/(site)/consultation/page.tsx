// src/app/consultation/page.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import ServiceCard from '@/components/consultation/ServiceCard'
import BookingEmbed from '@/components/consultation/BookingEmbed'
import { 
  IconStethoscope, 
  IconHeart, 
  IconMoodSmile, 
  IconMessageHeart,
  IconShieldCheck 
} from '@tabler/icons-react'

export default function ConsultationPage() {
  const services = [
    { title: 'Oral Health Education', icon: <IconMessageHeart />, desc: 'Personalized guidance on maintaining your dental health.' },
    { title: 'Preventive Care', icon: <IconShieldCheck />, desc: 'Understanding how to avoid common dental issues before they start.' },
    { title: 'Treatment Guidance', icon: <IconStethoscope />, desc: 'Expert explanations of various dental treatment options available to you.' },
    { title: "Children's Oral Health", icon: <IconMoodSmile />, desc: 'Specialized advice for parents and caregivers on pediatric dental care.' },
    { title: 'Hygiene Coaching', icon: <IconHeart />, desc: 'One-on-one coaching for better brushing and flossing techniques.' },
    { title: 'Second Opinion', icon: <IconStethoscope />, desc: 'A professional perspective on your existing dental concerns.' },
  ]

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <SectionLabel>Expert Guidance</SectionLabel>
          <h1 className="text-display-md md:text-display-lg font-display text-brand-navy">
            Book a session with Dr. Ibukun
          </h1>
          <p className="text-lg text-ink/60 font-body">
            Get personalized dental education and preventive guidance from the comfort of your home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {services.map((s, i) => (
            <ServiceCard key={i} title={s.title} icon={s.icon} desc={s.desc} />
          ))}
        </div>

        <div className="space-y-12">
          <div className="text-center space-y-4">
             <SectionLabel>Availability</SectionLabel>
             <h2 className="text-display-sm font-display text-brand-navy">Secure your slot</h2>
          </div>
          <BookingEmbed />
        </div>
      </div>
    </div>
  )
}

