import Link from "next/link";
import { Printer } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-1px)] items-center justify-center bg-surface py-12">
      <div className="w-full max-w-md container-px">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Printer className="size-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-text">PrintEve</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
