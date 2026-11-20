import type { MetadataRoute } from 'next';

// Generated once at build time (required for the static export).
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Simple Meditations',
    short_name: 'Meditations',
    description: 'A simple tool for Meditating.',
    scope: '/',
    start_url: '/',
    display: 'standalone',
    background_color: '#fde68a',
    theme_color: '#fde68a',
    icons: [
      {
        "src": "icons/android-chrome-36x36.png",
        "sizes": "36x36",
        "type": "image/png"
      },
      {
        "src": "icons/android-chrome-48x48.png",
        "sizes": "48x48",
        "type": "image/png"
      },
      {
        "src": "icons/android-chrome-72x72.png",
        "sizes": "72x72",
        "type": "image/png"
      },
      {
        "src": "icons/android-chrome-96x96.png",
        "sizes": "96x96",
        "type": "image/png"
      },
      {
        "src": "icons/android-chrome-144x144.png",
        "sizes": "144x144",
        "type": "image/png"
      },
      {
        "src": "icons/android-chrome-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "icons/android-chrome-256x256.png",
        "sizes": "256x256",
        "type": "image/png"
      },
      {
        "src": "icons/android-chrome-384x384.png",
        "sizes": "384x384",
        "type": "image/png"
      },
      {
        "src": "icons/android-chrome-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      },
      // The icons are full-bleed with the sun well inside the safe zone, so
      // Android can crop them to any shape.
      {
        "src": "icons/android-chrome-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "maskable"
      },
      {
        "src": "icons/android-chrome-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable"
      }
    ],
  }
}
