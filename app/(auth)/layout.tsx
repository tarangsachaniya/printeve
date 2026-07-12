import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-1px)] items-center justify-center bg-surface py-12">
      <div className="w-full max-w-md container-px">
        <Link href="/" className="mb-8 flex items-center justify-center">
          <Image src="/logo.png" alt="Priinteve" width={139} height={36} className="h-8 w-auto" />
        </Link>
        {children}
      </div>
    </div>
  );
}
