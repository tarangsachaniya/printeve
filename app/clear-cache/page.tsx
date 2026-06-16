import { revalidatePath } from "next/cache";

const SECRET = "pv_cache_xK7mP2nQ";

export default async function ClearCachePage({
  searchParams,
}: {
  searchParams: Promise<{ pwd?: string }>;
}) {
  const { pwd } = await searchParams;

  if (pwd !== SECRET) return null;

  revalidatePath("/", "layout");

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-text">Cache cleared</p>
        <p className="text-sm text-text-muted">{new Date().toISOString()}</p>
      </div>
    </div>
  );
}
