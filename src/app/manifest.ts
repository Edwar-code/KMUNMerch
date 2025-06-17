import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KMUNMerch',
    short_name: 'KeMUN',
    description: 'KMUNMerch Stylish Entrance',
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
