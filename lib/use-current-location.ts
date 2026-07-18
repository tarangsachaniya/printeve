"use client";

import * as React from "react";
import { api } from "@/lib/api";

export type LocationStatus = "idle" | "locating" | "geocoding" | "ready" | "error";

export interface ResolvedLocation {
  latitude: number;
  longitude: number;
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  formattedAddress?: string;
}

/** Staged GPS -> reverse-geocode flow (mirrors the mobile app's permission/locating/geocoding/ready machine). */
export function useCurrentLocation() {
  const [status, setStatus] = React.useState<LocationStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const reset = React.useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const locate = React.useCallback(async (): Promise<ResolvedLocation | null> => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("error");
      setError("Location isn't supported by this browser.");
      return null;
    }

    setStatus("locating");
    setError(null);

    let position: GeolocationPosition;
    try {
      position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );
    } catch (err) {
      setStatus("error");
      const denied = err instanceof GeolocationPositionError && err.code === err.PERMISSION_DENIED;
      setError(
        denied
          ? "Location access was denied. Allow it in your browser's site settings, or search / drop the pin manually."
          : "Couldn't get your location. Try again, or search / drop the pin manually."
      );
      return null;
    }

    setStatus("geocoding");
    const { latitude, longitude } = position.coords;

    const resolved = await api
      .get<ResolvedLocation>(`/places/reverse-geocode?lat=${latitude}&lng=${longitude}`)
      .catch(() => null);

    setStatus("ready");
    return resolved ? { ...resolved, latitude, longitude } : { latitude, longitude };
  }, []);

  return { status, error, locate, reset };
}
