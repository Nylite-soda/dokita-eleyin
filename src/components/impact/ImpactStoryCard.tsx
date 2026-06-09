// src/components/impact/ImpactStoryCard.tsx
import SanityImage from '@/components/ui/SanityImage'
import RichText from '@/components/ui/RichText'

interface ImpactStoryCardProps {
  story: any
}

export default function ImpactStoryCard({ story }: ImpactStoryCardProps) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-surface-card flex flex-col md:flex-row gap-8 items-start">
      <div className="shrink-0">
        <SanityImage 
          asset={story.photo} 
          alt={story.name}
          className="w-24 h-24 md:w-32 md:h-32 rounded-3xl"
          width={128}
          height={128}
        />
      </div>
      <div className="space-y-4">
        <div className="italic text-lg font-body text-ink/70 leading-relaxed">
          <RichText value={story.story} />
        </div>
        <div>
          <h4 className="font-display font-bold text-brand-navy">{story.name}</h4>
          <p className="text-sm text-ink/40 font-body">{story.role}, {story.location}</p>
        </div>
      </div>
    </div>
  )
}

