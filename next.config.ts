import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  // Empty turbopack config to silence the warning
  // Service workers work fine without special configuration
  turbopack: {},

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' https://*.vercel.app;script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.app https://*.firebaseio.com https://*.firebaseapp.com https://*.googleapis.com https://www.gstatic.com;style-src 'self' 'unsafe-inline' https://*.vercel.app https://fonts.googleapis.com;font-src 'self' https://*.vercel.app https://fonts.gstatic.com data:;connect-src 'self' https://*.vercel.app https://*.firebaseio.com https://*.firebaseapp.com https://*.googleapis.com https://www.gstatic.com wss://*.firebaseio.com;img-src 'self' https://*.vercel.app https://*.gstatic.com https://*.firebaseapp.com data: blob:;frame-src 'self' https://*.vercel.app https://*.firebaseapp.com;"
          }
        ],
      },
    ];
  },

  // Disable source maps in production to prevent source code exposure
  productionBrowserSourceMaps: false,
};

export default nextConfig;
