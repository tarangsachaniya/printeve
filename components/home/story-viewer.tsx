"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Volume2, VolumeX } from "lucide-react";
import type { Story } from "@/lib/types";
import { withVideoTransform } from "@/lib/cloudinary-video";
import { cn } from "@/lib/utils";

function redirectHref(redirectType: Story["slides"][number]["redirect_type"], value: string | null): string | null {
  if (!value) return null;
  if (redirectType === "product") return `/products/${value}`;
  if (redirectType === "category") return `/products?category=${value}`;
  if (redirectType === "url") return value;
  return null;
}

export function StoryViewer({
  stories,
  initialStoryIndex,
  onClose,
}: {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
}) {
  const [storyIndex, setStoryIndex] = useState(initialStoryIndex);
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const story = stories[storyIndex];
  const slide = story?.slides[slideIndex];

  const goToStory = useCallback(
    (index: number) => {
      if (index < 0 || index >= stories.length) {
        onClose();
        return;
      }
      setStoryIndex(index);
      setSlideIndex(0);
      setVideoProgress(0);
    },
    [stories.length, onClose]
  );

  const nextSlide = useCallback(() => {
    if (!story) return;
    if (slideIndex + 1 < story.slides.length) {
      setSlideIndex((i) => i + 1);
      setVideoProgress(0);
    } else {
      goToStory(storyIndex + 1);
    }
  }, [story, slideIndex, storyIndex, goToStory]);

  const prevSlide = useCallback(() => {
    if (slideIndex > 0) {
      setSlideIndex((i) => i - 1);
      setVideoProgress(0);
    } else {
      goToStory(storyIndex - 1);
    }
  }, [slideIndex, storyIndex, goToStory]);

  // Auto-advance timer for image slides
  useEffect(() => {
    if (!slide || slide.media_type !== "image" || paused) return;
    const timer = setTimeout(nextSlide, slide.duration_seconds * 1000);
    return () => clearTimeout(timer);
  }, [slide, paused, nextSlide]);

  // Video playback control
  useEffect(() => {
    const video = videoRef.current;
    if (!video || slide?.media_type !== "video") return;
    if (paused) video.pause();
    else video.play().catch(() => {});
  }, [paused, slide]);

  if (!story || !slide) return null;

  const href = redirectHref(slide.redirect_type, slide.redirect_value);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div
        className="relative h-full w-full max-w-[480px] overflow-hidden bg-black sm:h-[92vh] sm:rounded-xl"
        onTouchStart={(e) => {
          const t = e.touches[0];
          touchStartRef.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          const start = touchStartRef.current;
          if (!start) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - start.x;
          const dy = t.clientY - start.y;
          touchStartRef.current = null;
          if (Math.abs(dy) > 80 && Math.abs(dy) > Math.abs(dx)) {
            onClose();
            return;
          }
          if (Math.abs(dx) > 60) {
            if (dx > 0) goToStory(storyIndex - 1);
            else goToStory(storyIndex + 1);
          }
        }}
      >
        {/* Progress bars */}
        <div className="absolute inset-x-2 top-2 z-20 flex gap-1">
          {story.slides.map((s, i) => (
            <div key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full bg-white"
                style={
                  i < slideIndex
                    ? { width: "100%" }
                    : i > slideIndex
                    ? { width: "0%" }
                    : slide.media_type === "image"
                    ? {
                        width: "100%",
                        animation: `story-progress ${slide.duration_seconds}s linear forwards`,
                        animationPlayState: paused ? "paused" : "running",
                      }
                    : { width: `${videoProgress}%` }
                }
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute inset-x-2 top-5 z-20 flex items-center justify-between">
          <p className="truncate px-1 text-sm font-semibold text-white drop-shadow">{story.title}</p>
          <div className="flex items-center gap-2">
            {slide.media_type === "video" && (
              <button
                onClick={() => setMuted((m) => !m)}
                className="flex size-8 items-center justify-center rounded-full bg-black/30 text-white"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-black/30 text-white"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Media */}
        <div className="relative h-full w-full">
          {slide.media_type === "video" ? (
            <video
              ref={videoRef}
              key={slide.id}
              src={withVideoTransform(slide.media_url)}
              className="h-full w-full object-cover"
              muted={muted}
              playsInline
              autoPlay
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                if (v.duration) setVideoProgress((v.currentTime / v.duration) * 100);
              }}
              onEnded={nextSlide}
            />
          ) : (
            <Image
              key={slide.id}
              src={slide.media_url}
              alt={story.title}
              fill
              sizes="480px"
              priority
              className="object-cover"
            />
          )}
        </div>

        {/* Tap zones */}
        <button
          className="absolute inset-y-0 left-0 z-10 w-1/3"
          aria-label="Previous"
          onClick={prevSlide}
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
        />
        <button
          className="absolute inset-y-0 right-0 z-10 w-2/3"
          aria-label="Next"
          onClick={nextSlide}
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
        />

        {/* CTA */}
        {href && (
          <Link
            href={href}
            target={slide.redirect_type === "url" ? "_blank" : undefined}
            className={cn(
              "absolute inset-x-4 bottom-4 z-20 flex items-center justify-center rounded-full",
              "bg-white/95 py-2.5 text-sm font-semibold text-text shadow-lg"
            )}
          >
            Learn more
          </Link>
        )}
      </div>
    </div>
  );
}
