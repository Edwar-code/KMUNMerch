import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KeMUN-Connect',
    short_name: 'KeMUN',
    description: 'KeMUN-diplomatic experiences, networking, growth, recreation, formal engagements.',
    start_url: '/',
    display: 'standalone',
    background_color: '#111827',
    theme_color: '#be123c',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
