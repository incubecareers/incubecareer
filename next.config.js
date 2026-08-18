/** @type {import('next').NextConfig} */

// Baseline security headers applied to every response. Intentionally excludes a
// strict Content-Security-Policy for now: the app loads Razorpay checkout,
// Google Sign-In and YouTube/Vimeo/Cloudinary embeds, so a CSP must be authored
// and tested against those origins in a dedicated pass before enforcing (adding
// a wrong CSP would silently break payments). These headers are safe today.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Protects our own pages from being framed (clickjacking). Does not affect
  // our ability to embed third-party players.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig = {
  // Image optimization
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.science.nasa.gov',
      },
    ],
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // React optimizations
  reactStrictMode: true,
  
  // Performance improvements
  swcMinify: true,
  
  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Cache static assets aggressively
      {
        source: '/logo.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
