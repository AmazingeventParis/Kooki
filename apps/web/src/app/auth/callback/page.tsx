'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Store token
    localStorage.setItem('kooki_token', token);

    // Check for registration context (role + org data from registration flow)
    const contextRaw = localStorage.getItem('kooki_register_context');
    if (contextRaw) {
      localStorage.removeItem('kooki_register_context');
      try {
        const context = JSON.parse(contextRaw);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        fetch(`${apiUrl}/auth/complete-registration`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(context),
        })
          .then(() => {
            window.location.href = '/dashboard';
          })
          .catch(() => {
            // Even if complete-registration fails, redirect to dashboard
            window.location.href = '/dashboard';
          });
      } catch {
        window.location.href = '/dashboard';
      }
    } else {
      window.location.href = '/dashboard';
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kooki-500 mx-auto" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
