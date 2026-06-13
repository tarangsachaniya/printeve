import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductImage({
  src,
  alt,
  className,
  sizes,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  if (!src) {
    return (
      <div className={cn("absolute inset-0 flex items-center justify-center bg-surface text-text-muted", className)}>
        <ImageOff className="size-8" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "(max-width: 768px) 100vw, 33vw"}
      className={cn("object-cover", className)}
    />
  );
}
