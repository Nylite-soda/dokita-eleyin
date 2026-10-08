// src/components/learning/ArticleBody.tsx
import RichText from '@/components/ui/RichText'
import { PortableTextContent } from '@/types'

interface ArticleBodyProps {
  content?: PortableTextContent
}

export default function ArticleBody({ content }: ArticleBodyProps) {
  return (
    <article className="max-w-3xl mx-auto py-12">
      <RichText value={content} />
    </article>
  )
}

