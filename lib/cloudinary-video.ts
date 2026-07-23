/**
 * Injects Cloudinary's f_auto,q_auto transform into a video delivery URL.
 * Mirrors the string-replace technique in lib/cloudinary-loader.ts, which only
 * intercepts next/image (images) — <video> elements need this applied manually.
 */
export function withVideoTransform(url: string): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/video/upload/")) return url;
  return url.replace("/video/upload/", "/video/upload/f_auto,q_auto/");
}
