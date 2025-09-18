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
  // Remove static export to enable API routes
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
