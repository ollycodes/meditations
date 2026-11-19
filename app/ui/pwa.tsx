import { useState, useEffect } from 'react';

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

export function PermissionRequest() {
  const [permission, setPermission] = useState<string | null>(checkNotification);

  useEffect(() => {
    const check = async () => {
      setPermission(checkNotification);

      if (!permission) {
        return
      }

      try {
        const permissionStatus = (await navigator.permissions?.query({ name: 'notifications' }) || null)

        if (permissionStatus) {
          permissionStatus.onchange = () => {
            setPermission(permissionStatus.state);
          };
          setPermission(permissionStatus.state);
        }
      } catch (err) {
        console.log('error:', err)
        setPermission(null);
      }
    }
    check();
  }, [permission]);

  const showPermissions = () => {
    switch (permission) {
      case 'granted': {
        return (
          <div className='flex flex-row justify-between items-center w-3/4'>
            <label>Push Notifications enabled.</label>
            <button
              className='bg-orange-50 hover:bg-orange-200 
          border-solid border-2 border-orange-200'
              onClick={() => {
                showNotification('How\'s it hanging? 😎', {
                  body: '🌊 The mind is a wonderful place.',
                  icon: '/icons/apple-touch-icon.png'
                })
              }}
            >Test</button>
          </div>)
      }
      case null: {
        return (<p className='w-3/4'>Push notifications not supported.</p>)
      }
      case 'default': {
        return (
          <button
            className='bg-red-200 px-2
            hover:bg-red-300 active:bg-red-400
            border-solid border-1 border-red-300
            rounded-md'
            onClick={async () => {
              try {
                const newPermission = (await Notification?.requestPermission() || null);
                setPermission(newPermission);
              } catch (err) {
                console.log('Permission registration failed:', err);
              }
            }}>Enable Push Notifications</button>
        )
      }
      case 'denied': {
        return (<p>Push Notifications are disabled.</p>)
      }
    }
  }

  return (
    <div className='py-1 my-2 w-full flex flex-col justify-center items-center'>
      {showPermissions()}
    </div>
  );
}

export function InstallPrompt() {
  // Only rendered once the settings menu is opened, so `window` is available.
  const [isIOS] = useState(() => /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window))
  const [isStandalone] = useState(() => window.matchMedia('(display-mode: standalone)').matches)

  if (isStandalone) {
    return null
  }

  return (
    <>
      {isStandalone ? null : <div className='w-3/4'>
        {isIOS && (
          <>
            <h3>Install as an App</h3>
            <p>
              To install this app on your iOS device, tap the share button below
              <span role="img" aria-label="share icon">
                {' ⎋ '}
              </span>
              and then tap &ldquo;Add to Home Screen&rdquo;
              <span role="img" aria-label="plus icon">
                {' '}➕{' '}
              </span>.
            </p>
          </>
        )}
      </div>}
    </>
  )
}
