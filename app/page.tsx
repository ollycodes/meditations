'use client';

import { useState, useEffect, useCallback } from 'react';
import { TimerForm } from '@/app/ui/forms';
import { Timer } from '@/app/ui/meditations';

export default function Home() {
  const [timer, setTimer] = useState(false);
  const toggleTimer = useCallback(() => setTimer((on) => !on), []);

  useEffect(() => {
    // Only in production: caching dev bundles makes local changes look stale.
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      }).catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }

  }, [])

  return (
    <>
      {/* dvh, not vh: on phones 100vh is taller than the visible area while the
          browser toolbars are showing, which made the page scroll and jump. */}
      <main
        className="h-dvh overflow-y-auto overscroll-none flex flex-col
        px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]
        bg-gradient-to-t from-amber-200 via-amber-100 to-amber-50">
        <div className="w-full max-w-sm m-auto">
          {timer ? (
            <Timer toggleTimer={toggleTimer} />
          ) : (
            <TimerForm toggleTimer={toggleTimer} />
          )}
        </div>
      </main>
    </>
  );
}
