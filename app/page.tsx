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
      <main
        className="flex flex-col items-center justify-center
        p-6 h-screen
        bg-gradient-to-t from-amber-200 via-amber-100 to-amber-50">
        {timer ? (
          <Timer toggleTimer={toggleTimer} />
        ) : (
          <TimerForm toggleTimer={toggleTimer} />
        )}
      </main>
    </>
  );
}
