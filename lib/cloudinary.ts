/**
 * Convert an image `File` to a WebP `Blob` in the browser (canvas re-encode).
 * Mirrors the admin panel's converter (`printvana-admin/lib/cloudinary.ts`) so
 * every client uploads WebP masters. Quality 0.85 is a good size/quality balance.
 */
export function toWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("WebP conversion failed"))),
        "image/webp",
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
}
