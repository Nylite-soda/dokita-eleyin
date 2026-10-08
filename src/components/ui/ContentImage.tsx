import Image, { ImageProps } from 'next/image'
import { getContentImageUrl } from '@/lib/content-image'
import { cn } from '@/lib/utils'
import type { ImageObject } from '@/types'

interface ContentImageProps {
  asset?: ImageObject | null
  alt?: string
  width?: number
  height?: number
  className?: string
  imageClassName?: string
  fill?: boolean
  sizes?: string
  preload?: boolean
  loading?: ImageProps['loading']
  fetchPriority?: ImageProps['fetchPriority']
}

export default function ContentImage({ asset, alt = '', width, height, className, imageClassName, fill, sizes = '(max-width: 768px) 100vw, 50vw', preload, loading, fetchPriority }: ContentImageProps) {
  const src = getContentImageUrl(asset)
  if (!src) return null
  return <div className={cn('relative overflow-hidden bg-surface-card', fill ? 'w-full h-full' : 'w-full', className)}>
    <Image src={src} alt={alt} width={width} height={height} fill={fill} sizes={sizes} preload={preload} loading={preload ? undefined : loading} fetchPriority={preload ? undefined : fetchPriority} className={cn('object-cover', fill ? 'absolute inset-0 h-full w-full' : 'h-auto w-full', imageClassName)} />
  </div>
}
