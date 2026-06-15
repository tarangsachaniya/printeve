import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST() {
  revalidatePath("/", "layout");

  return NextResponse.json({ cleared: true, now: Date.now() });
}
