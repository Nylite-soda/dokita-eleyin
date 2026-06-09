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

  let imageUrl = ""
  try {
    imageUrl = urlForImage(asset).url()
  } catch (error) {
    console.error("SanityImage: Failed to generate URL", error)
    return null
  }

  if (!imageUrl) return null

  return (
    <div className={cn("relative overflow-hidden bg-surface-card w-full h-full", className)}>
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={cn(
          "object-cover transition-opacity duration-300",
          fill ? "absolute inset-0 h-full w-full" : ""
        )}
      />
    </div>
  )
}

