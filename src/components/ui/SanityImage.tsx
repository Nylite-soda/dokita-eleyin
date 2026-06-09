// src/components/ui/SanityImage.tsx
import Image from 'next/image'
import { urlForImage } from '@/lib/sanity.image'
import { cn } from '@/lib/utils'

interface SanityImageProps {
  asset: any
  alt?: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
}

export default function SanityImage({ asset, alt = "", width, height, className, fill }: SanityImageProps) {
  if (!asset) return null

  const imageUrl = urlForImage(asset).url()

  return (
    <div className={cn("relative overflow-hidden bg-surface-card", className)}>
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={cn(
          "object-cover transition-opacity duration-300",
          fill ? "h-full w-full" : ""
        )}
      />
    </div>
  )
}
