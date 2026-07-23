"use client";

import { useState } from "react";
import Image from "next/image";
import type { Story } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StoryViewer } from "./story-viewer";

export function StoriesRailClient({ stories }: { stories: Story[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-7xl container-px py-6">
      <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stories.map((story, i) => {
          const cover = story.cover_image_url ?? story.slides[0]?.media_url ?? null;
          return (
            <button
              key={story.id}
              onClick={() => setOpenIndex(i)}
              className="group flex shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "flex size-16 items-center justify-center rounded-full p-[2px]",
                  "bg-[var(--gradient-brand)]"
                )}
              >
                <span className="relative size-full overflow-hidden rounded-full border-2 border-background bg-surface">
                  {cover ? (
                    <Image src={cover} alt="" fill sizes="64px" className="object-cover" />
                  ) : null}
                </span>
              </span>
              <span className="max-w-16 truncate text-xs font-medium text-text">{story.title}</span>
            </button>
          );
        })}
      </div>

      {openIndex !== null && (
        <StoryViewer
          stories={stories}
          initialStoryIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
}
