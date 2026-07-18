"use client";

import * as React from "react";
import { LocateFixed, Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { loadGoogleMaps } from "@/lib/google-maps-loader";
import { useCurrentLocation, type ResolvedLocation } from "@/lib/use-current-location";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Ahmedabad — matches the mobile app's DEFAULT_REGION fallback center.
const DEFAULT_CENTER = { lat: 23.0225, lng: 72.5714 };

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onResolved: (loc: ResolvedLocation) => void;
}

type SdkStatus = "loading" | "ready" | "error";

export function MapPicker({ latitude, longitude, onResolved }: MapPickerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<google.maps.Map | null>(null);
  const markerRef = React.useRef<google.maps.Marker | null>(null);
  const onResolvedRef = React.useRef(onResolved);
  React.useEffect(() => {
    onResolvedRef.current = onResolved;
  }, [onResolved]);

  const [sdkStatus, setSdkStatus] = React.useState<SdkStatus>("loading");
  const [sdkError, setSdkError] = React.useState<string | null>(null);
  const [reloadTick, setReloadTick] = React.useState(0);
  const [resolving, setResolving] = React.useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = React.useState(false);

  const { status: gpsStatus, error: gpsError, locate } = useCurrentLocation();

  const resolveLatLng = React.useCallback(async (lat: number, lng: number) => {
    setResolving(true);
    try {
      const resolved = await api.get<ResolvedLocation>(`/places/reverse-geocode?lat=${lat}&lng=${lng}`);
      onResolvedRef.current({ ...resolved, latitude: lat, longitude: lng });
    } catch {
      // Keep the pin where it was dropped even if reverse geocoding fails —
      // the rest of the form stays editable so the user isn't blocked.
      onResolvedRef.current({ latitude: lat, longitude: lng });
      toast.error("Couldn't look up that address — you can still fill it in manually.");
    } finally {
      setResolving(false);
    }
  }, []);

  // Load SDK + initialize map once.
  React.useEffect(() => {
    let cancelled = false;
    setSdkStatus("loading");
    setSdkError(null);

    loadGoogleMaps()
      .then((g) => {
        if (cancelled || !containerRef.current) return;

        const center = latitude != null && longitude != null ? { lat: latitude, lng: longitude } : DEFAULT_CENTER;

        const map = new g.maps.Map(containerRef.current, {
          center,
          zoom: latitude != null ? 16 : 12,
          mapTypeControl: true,
          mapTypeControlOptions: { style: g.maps.MapTypeControlStyle.DROPDOWN_MENU },
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          clickableIcons: false,
        });

        const marker = new g.maps.Marker({
          map,
          position: center,
          draggable: true,
          animation: g.maps.Animation.DROP,
        });

        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (pos) resolveLatLng(pos.lat(), pos.lng());
        });

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          marker.setPosition(e.latLng);
          resolveLatLng(e.latLng.lat(), e.latLng.lng());
        });

        mapRef.current = map;
        markerRef.current = marker;
        setSdkStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setSdkStatus("error");
        setSdkError(err instanceof Error ? err.message : "Failed to load the map.");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadTick]);

  // Re-center the map when lat/lng change from outside (e.g. search selection).
  React.useEffect(() => {
    if (sdkStatus !== "ready" || latitude == null || longitude == null) return;
    const pos = { lat: latitude, lng: longitude };
    markerRef.current?.setPosition(pos);
    mapRef.current?.panTo(pos);
    if ((mapRef.current?.getZoom() ?? 0) < 15) mapRef.current?.setZoom(16);
  }, [latitude, longitude, sdkStatus]);

  async function handleUseCurrentLocation() {
    setShowPermissionPrompt(false);
    const resolved = await locate();
    if (resolved) onResolvedRef.current(resolved);
  }

  const gpsBusy = gpsStatus === "locating" || gpsStatus === "geocoding";
  const statusText =
    gpsStatus === "locating" ? "Getting your location…" : gpsStatus === "geocoding" ? "Finding your address…" : null;

  if (sdkStatus === "error") {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface/50 p-6 text-center">
        <AlertTriangle className="size-6 text-text-muted" />
        <p className="max-w-xs text-sm text-text-muted">{sdkError}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => setReloadTick((t) => t + 1)}>
          <RotateCcw className="size-3.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {sdkStatus === "loading" && <Skeleton className="h-72 w-full rounded-xl" />}
      <div
        ref={containerRef}
        className={cn("h-72 w-full overflow-hidden rounded-xl border border-border", sdkStatus !== "ready" && "hidden")}
      />

      {sdkStatus === "ready" && (
        <>
          <div className="absolute bottom-3 right-3 flex flex-col items-end gap-2">
            {showPermissionPrompt && (
              <div className="w-64 rounded-xl border border-border bg-background p-3 shadow-[var(--shadow-card-hover)]">
                <p className="text-xs font-medium text-text">Use your current location?</p>
                <p className="mt-0.5 text-xs text-text-muted">We&apos;ll pin your delivery address accurately. Your browser will ask to confirm.</p>
                <div className="mt-2 flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowPermissionPrompt(false)}>
                    Not now
                  </Button>
                  <Button type="button" size="sm" onClick={handleUseCurrentLocation}>
                    Allow
                  </Button>
                </div>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-background shadow-[var(--shadow-card)]"
              disabled={gpsBusy}
              onClick={() => setShowPermissionPrompt(true)}
            >
              {gpsBusy ? <Loader2 className="size-3.5 animate-spin" /> : <LocateFixed className="size-3.5" />}
              Locate me
            </Button>
          </div>

          {(statusText || resolving) && (
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium text-text shadow-[var(--shadow-card)]">
              <Loader2 className="size-3 animate-spin text-primary" />
              {statusText ?? "Resolving address…"}
            </div>
          )}

          {gpsError && gpsStatus === "error" && (
            <div className="absolute left-3 right-3 top-3 rounded-lg bg-danger/90 px-3 py-2 text-xs text-white shadow-[var(--shadow-card)]">
              {gpsError}
            </div>
          )}
        </>
      )}

      <p className="mt-2 text-xs text-text-muted">Drag the pin, click the map, or search above to set the exact location.</p>
    </div>
  );
}
