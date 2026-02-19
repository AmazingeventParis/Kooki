import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-kooki-50 via-white to-grape-500/5 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob blob-coral w-96 h-96 -top-40 -right-40 opacity-10 fixed" />
      <div className="blob blob-purple w-80 h-80 bottom-0 -left-40 opacity-10 fixed" />

      {/* Logo */}
      <div className="pt-8 px-8 relative z-10">
        <Link href="/">
          <span className="text-2xl font-extrabold font-[family-name:var(--font-heading)] gradient-text">
            Kooki
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
