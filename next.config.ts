import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Optimisations pour Docker
  compress: true,
  poweredByHeader: false
}

export default nextConfig
