"use client";

declare global {
  interface Window {
    google?: typeof google;
    __printeveGoogleMapsCallback?: () => void;
  }
}

let loadPromise: Promise<typeof google> | null = null;

/** Loads the Google Maps JS SDK once and caches the promise across every MapPicker instance on the page. */
export function loadGoogleMaps(): Promise<typeof google> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("No window"));
    if (window.google?.maps) return resolve(window.google);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return reject(new Error("Maps isn't configured yet (missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)."));

    const existing = document.getElementById("google-maps-sdk");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google!));
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps.")));
      return;
    }

    window.__printeveGoogleMapsCallback = () => resolve(window.google!);

    const script = document.createElement("script");
    script.id = "google-maps-sdk";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&loading=async&callback=__printeveGoogleMapsCallback`;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps."));
    document.head.appendChild(script);
  });

  return loadPromise;
}
