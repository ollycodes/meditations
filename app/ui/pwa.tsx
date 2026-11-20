import { useState, useEffect } from 'react';
import { softButton } from '@/app/ui/styles';

export const checkNotification = (): NotificationPermission | null => {
  return (typeof Notification !== 'undefined' ? Notification.permission : null)
}

// Android Chrome throws on `new Notification()` from a page; notifications must
// go through the service worker there. Fall back to the constructor elsewhere.
export async function showNotification(title: string, options: NotificationOptions) {
  if (checkNotification() !== 'granted') return;
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification(title, options);
      return;
    }
  } catch (err) {
    console.log('Service worker notification failed:', err);
  }
  try {
    new Notification(title, options);
  } catch (err) {
    console.log('Notification failed:', err);
  }
}

// Keeps the screen awake while `active` is true. Browsers drop the lock when
// the page is hidden, so it's re-requested whenever the page becomes visible.
export function useWakeLock(active: boolean): boolean {
  const [supported] = useState(() => typeof navigator !== 'undefined' && 'wakeLock' in navigator);

  useEffect(() => {
    if (!active || !supported) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) {
          lock.release();
        } else {
          sentinel = lock;
        }
      } catch (err) {
        console.log('Wake lock unavailable:', err);
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (!sentinel || sentinel.released)) {
        request();
      }
    };

    request();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      sentinel?.release();
    };
  }, [active, supported]);

  return supported;
}

export function NotificationSetting() {
  const [permission, setPermission] = useState<NotificationPermission | null>(checkNotification);

  // Follow changes made in the browser's own site settings.
  useEffect(() => {
    let status: PermissionStatus | undefined;
    navigator.permissions?.query({ name: 'notifications' })
      .then((s) => {
        status = s;
        s.onchange = () => setPermission(checkNotification());
      })
      .catch(() => { });
    return () => {
      if (status) status.onchange = null;
    };
  }, []);

  const control = () => {
    switch (permission) {
      case 'granted':
        return (
          <button
            type='button'
            className={`${softButton} px-3 py-1 text-sm`}
            onClick={() => showNotification('How\'s it hanging? 😎', {
              body: '🌊 The mind is a wonderful place.',
              icon: '/icons/apple-touch-icon.png'
            })}
          >Test</button>
        );
      case 'default':
        return (
          <button
            type='button'
            className={`${softButton} px-3 py-1 text-sm`}
            onClick={async () => {
              try {
                setPermission(await Notification.requestPermission());
              } catch (err) {
                console.log('Permission request failed:', err);
              }
            }}
          >Enable</button>
        );
      case 'denied':
        return <span className='text-sm font-light'>Blocked in browser</span>;
      default:
        return <span className='text-sm font-light'>Not supported</span>;
    }
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-col'>
        <span>Notifications</span>
        <span className='text-sm font-light'>
          {permission === 'granted' ? 'On when a session ends' : 'Alert when a session ends'}
        </span>
      </div>
      {control()}
    </div>
  );
}

export function InstallPrompt() {
  // Only rendered once settings are opened, so `window` is available.
  const [isIOS] = useState(() => /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window))
  const [isStandalone] = useState(() => window.matchMedia('(display-mode: standalone)').matches)

  if (!isIOS || isStandalone) {
    return null
  }

  return (
    <p className='text-sm font-light text-center'>
      Install: tap Share
      <span role='img' aria-label='share icon'>{' ⎋ '}</span>
      then &ldquo;Add to Home Screen&rdquo;.
    </p>
  )
}
