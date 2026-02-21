'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokenFromOAuth } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    const token = searchParams.get('token');
    if (token) {
      processed.current = true;
      setTokenFromOAuth(token);
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [searchParams, router, setTokenFromOAuth]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kooki-500 mx-auto mb-4" />
        <p className="text-gray-500">Connexion en cours...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kooki-500 mx-auto" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
