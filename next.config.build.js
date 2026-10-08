/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    swcLoader: true,
    workerThreadPooling: true
  }
};

module.exports = nextConfig;
