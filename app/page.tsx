'use client';

import { useState, useEffect } from 'react';
import { TimerForm } from '@/app/ui/forms';
import { Timer } from '@/app/ui/meditations';

export default function Home() {
  const [timer, toggleTimer] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
        // console.log(registration.getNotifications());
        // registration.showNotification('Service Worker installed.');
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
          <Timer toggleTimer={(): void => toggleTimer(!timer)} />
        ) : (
          <TimerForm toggleTimer={(): void => toggleTimer(!timer)} />
        )}
      </main>
    </>
  );
}
