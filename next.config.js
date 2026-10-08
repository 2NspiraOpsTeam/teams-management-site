/** @type {import('next').NextConfig} */
const nextConfig = {
  // OpenNext Cloudflare Workers configuration for Teams Management
  // Isolated from 2Nspira infrastructure
  output: 'standalone',
  
  // Environment variable substitution
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Teams Management',
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'production'
  },
  
  // Image optimization configuration
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    disableStaticImages: false,
    minimumCacheTTL: 31536000
  },
  
  // Swc compiler configuration
  experimental: {
    swcLoader: true,
    workerThreadPooling: true
  }
};

module.exports = nextConfig;
