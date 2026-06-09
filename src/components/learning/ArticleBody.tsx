// src/components/learning/ArticleBody.tsx
import RichText from '@/components/ui/RichText'

interface ArticleBodyProps {
  content: any
}

export default function ArticleBody({ content }: ArticleBodyProps) {
  return (
    <article className="max-w-3xl mx-auto py-12">
      <RichText value={content} />
    </article>
  )
}
