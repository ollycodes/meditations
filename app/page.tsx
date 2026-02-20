'use client';

import { useState, useEffect } from 'react';
import { TimerForm } from '@/app/ui/forms';
import { Timer } from '@/app/ui/meditations';

export default function Home() {
  const [timer, toggleTimer] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return undefined;
    }

    let hasRefreshed = false;
    const handleConnectionStatus = () => setIsOffline(!navigator.onLine);
    const handleControllerChange = () => {
      if (hasRefreshed) {
        return;
      }
      hasRefreshed = true;
      window.location.reload();
    };

    handleConnectionStatus();
    window.addEventListener('online', handleConnectionStatus);
    window.addEventListener('offline', handleConnectionStatus);

    navigator.serviceWorker.register('/sw.js').then((workerRegistration) => {
      setRegistration(workerRegistration);
      if (workerRegistration.waiting) {
        setUpdateReady(true);
      }

      workerRegistration.addEventListener('updatefound', () => {
        const installingWorker = workerRegistration.installing;
        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateReady(true);
          }
        });
      });
    }).catch((error) => {
      console.error('Service Worker registration failed:', error);
    });

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      window.removeEventListener('online', handleConnectionStatus);
      window.removeEventListener('offline', handleConnectionStatus);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const applyUpdate = () => {
    if (!registration?.waiting) {
      window.location.reload();
      return;
    }

    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  return (
    <>
      <main
        className="flex flex-col items-center justify-center
        p-6 h-screen relative
        bg-gradient-to-t from-amber-200 via-amber-100 to-amber-50">
        <div className="absolute top-4 flex flex-col gap-2 items-center">
          {isOffline ? (
            <div
              className="px-4 py-2 rounded-lg
              border border-orange-400 bg-orange-100 text-orange-900">
              Offline mode: saved meditation features are available.
            </div>
          ) : null}
          {updateReady ? (
            <button
              type="button"
              className="px-4 py-2 rounded-lg
              border border-emerald-400 bg-emerald-100 text-emerald-900
              hover:bg-emerald-200 active:bg-emerald-300"
              onClick={applyUpdate}>
              Update available. Reload now.
            </button>
          ) : null}
        </div>
        {timer ? (
          <Timer toggleTimer={(): void => toggleTimer(!timer)} />
        ) : (
          <TimerForm toggleTimer={(): void => toggleTimer(!timer)} />
        )}
      </main>
    </>
  );
}
