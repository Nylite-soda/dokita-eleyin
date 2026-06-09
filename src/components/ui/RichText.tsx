// src/components/ui/RichText.tsx
import { PortableText, PortableTextComponents } from '@portabletext/react'
import SanityImage from './SanityImage'
import { cn } from '@/lib/utils'

interface RichTextProps {
  value: any
  className?: string
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="text-display-sm mt-12 mb-6 font-display text-brand-darkBlue">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl mt-8 mb-4 font-display text-brand-navy">{children}</h3>,
    normal: ({ children }) => <p className="mb-6 leading-relaxed text-ink/90">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-brand-lightBlue pl-6 py-2 my-8 italic font-body text-ink/80 text-lg">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 mb-8 space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 mb-8 space-y-2">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-brand-darkBlue">{children}</strong>,
    link: ({ children, value }) => (
      <a 
        href={value.href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-brand-lightBlue underline decoration-brand-lightBlue/30 underline-offset-4 hover:decoration-brand-lightBlue transition-all"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => (
      <div className="my-10">
        <SanityImage 
          asset={value} 
          alt={value.alt || "Article image"} 
          className="rounded-2xl shadow-lg" 
          width={800} 
          height={500}
        />
        {value.caption && (
          <p className="mt-3 text-center text-sm text-ink/50 font-body">{value.caption}</p>
        )}
      </div>
    ),
  },
}

export default function RichText({ value, className }: RichTextProps) {
  if (!value) return null
  
  return (
    <div className={cn("prose prose-lg max-w-none font-body", className)}>
      <PortableText value={value} components={components} />
    </div>
  )
}
