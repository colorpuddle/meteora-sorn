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
  // Optimize for Cloudflare Pages deployment
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Disable webpack caching completely for Cloudflare Pages
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Disable all caching to prevent large cache files
    config.cache = false;
    return config;
  },
};

export default nextConfig;
