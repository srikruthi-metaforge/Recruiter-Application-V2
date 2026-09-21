import type { NextConfig } from 'next'

const apiProxy = process.env.API_PROXY_URL || 'http://localhost:3001'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['plotly.js-dist', 'react-plotly.js'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxy}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
