import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.name || !body?.email || !body?.message) {
    return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
  }

  // TODO: forward to support inbox / CRM once available.
  return NextResponse.json({ message: "Thanks! We'll get back to you within 24 hours." });
}
