import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Cloudflare Pages routing configuration
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  // Add custom rewrites for proper routing
  async rewrites() {
    return [
      {
        source: '/create-pool',
        destination: '/create-pool',
      },
      {
        source: '/token/:id',
        destination: '/token/:id',
      },
    ];
  },
  // Disable webpack caching completely for Cloudflare Pages
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Disable all caching to prevent large cache files
    config.cache = false;
    return config;
  },
};

export default nextConfig;
