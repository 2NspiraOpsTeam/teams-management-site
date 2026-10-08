/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Teams Management - OpenNext/Cloudflare Workers Configuration */
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
