import { api } from "@/lib/api";
import type { Campaign } from "@/lib/types";

export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const res = await api.get<{ items: Campaign[] }>("/campaigns");
    return res.items ?? [];
  } catch {
    return [];
  }
}
