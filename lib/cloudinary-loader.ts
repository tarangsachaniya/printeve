'use client'

/**
 * Custom Next.js Image loader that serves Cloudinary images directly
 * via Cloudinary's CDN instead of proxying through Next.js image optimizer.
 *
 * This eliminates the TimeoutError that occurs when Next.js tries to
 * fetch & re-process large images from Cloudinary.
 *
 * Cloudinary already handles:
 *  - Format conversion (WebP/AVIF)
 *  - Quality optimization
 *  - Resizing (via `w_` transformation)
 *  - Global CDN delivery
 */

interface LoaderProps {
  src: string
  width: number
  quality?: number
}

export default function cloudinaryLoader({ src, width, quality }: LoaderProps): string {
  // If it's already a Cloudinary URL, inject transformations
  if (src.includes('res.cloudinary.com')) {
    const q = quality ?? 75
    // Insert transformations before the version segment (v123456...)
    // e.g. https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg
    //   -> https://res.cloudinary.com/demo/image/upload/w_800,q_75,f_auto/v1234/sample.jpg
    const transformed = src.replace(
      '/image/upload/',
      `/image/upload/w_${width},q_${q},f_auto/`
    )
    return transformed
  }

  // For all other URLs, return as-is (fallback)
  return src
}
