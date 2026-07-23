import { getStories } from "@/lib/stories";
import { StoriesRailClient } from "./stories-rail-client";

export async function StoriesRail() {
  const stories = await getStories();

  if (stories.length === 0) return null;

  return <StoriesRailClient stories={stories} />;
}
