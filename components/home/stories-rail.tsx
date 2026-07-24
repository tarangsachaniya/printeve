import type { Story } from "@/lib/types";
import { StoriesRailClient } from "./stories-rail-client";

export function StoriesRail({ stories }: { stories: Story[] }) {
  if (stories.length === 0) return null;

  return <StoriesRailClient stories={stories} />;
}
