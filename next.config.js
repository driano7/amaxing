const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// You might need to insert additional domains in script-src if you are using external services
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self';
  frame-src giscus.app
`

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  images: {
    domains: [
      'images.unsplash.com',
      'imageio.forbes.com',
      'mmx.prnewswire.com',
      'gcaptain.com',
      'avatars.githubusercontent.com',
    ],
  },
  eslint: {
    dirs: ['pages', 'components', 'lib', 'layouts', 'scripts'],
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Next.js 12.1.4 has a bug detecting @types/react.
    // Skip type checking during build to avoid false errors.
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: false },
      { source: '/experiences', destination: '/journeys', permanent: false },
      { source: '/experiences/:slug*', destination: '/journeys/:slug*', permanent: false },
      { source: '/stories', destination: '/guides', permanent: false },
      { source: '/stories/:slug*', destination: '/guides/:slug*', permanent: false },
      { source: '/news', destination: '/local-picks', permanent: false },
      { source: '/news/:slug*', destination: '/local-picks/:slug*', permanent: false },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  webpack: (config, { dev, isServer }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // Ensure hooks folder is resolvable
    config.resolve.modules = ['node_modules', 'lib', 'components', 'pages', 'layouts']

    // @fontsource/lato's package.json uses an "exports" map with sass/default
    // conditions + wildcard patterns that Next 12.1.4's resolver can't handle.
    // Fall back to classic file resolution (works like @fontsource/inter).
    config.resolve.exportsFields = []

    // With exportsFields disabled above, fast-equals resolves to a build this
    // old webpack can't statically analyze → `deepEqual` is undefined at
    // runtime and react-smooth chart animations crash. Point the package at a
    // minimal CommonJS shim (react-smooth only uses `deepEqual`).
    const path = require('path')
    config.resolve.alias['fast-equals'] = path.join(__dirname, 'lib/shims/fast-equals.js')

    if (!dev && !isServer) {
      // Replace React with Preact only in client production build
      Object.assign(config.resolve.alias, {
        'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
        // Ensure next/navigation is not affected by Preact alias
        'next/navigation': 'next/navigation',
        next: 'next',
      })
    }

    return config
  },
})
