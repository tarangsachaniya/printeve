"use client";

import { useEffect } from "react";

// Layouts persist across param changes within the same route segment, so
// navigating between two product pages (different [slug], same tree) doesn't
// get the scroll-to-top a cross-segment navigation gets for free. Templates
// force a fresh mount on every navigation into this segment, which fixes it.
export default function ProductTemplate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return <>{children}</>;
}
