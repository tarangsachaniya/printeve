import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

const SECRET = "pv_cache_xK7mP2nQ";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pwd = searchParams.get("pwd");

  if (pwd !== SECRET) {
    return new NextResponse(null, { status: 401 });
  }

  revalidatePath("/", "layout");

  return new NextResponse(
    `<html><body><div style="display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;"><div><p style="font-size:1.125rem;font-weight:600;">Cache cleared</p><p style="font-size:0.875rem;">${new Date().toISOString()}</p></div></div></body></html>`,
    {
      headers: { "Content-Type": "text/html" },
    }
  );
}
