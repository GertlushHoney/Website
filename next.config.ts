import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
      {
        // Cart line item images (basket-drawer.tsx) come straight from
        // Shopify's own variant image, not Sanity — only started being
        // needed once real product images were uploaded to Shopify
        // (2026-08-12), which is when this was missing and crashed the
        // basket entirely.
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
