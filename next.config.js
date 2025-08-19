/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless']
  }
};

module.exports = nextConfig;
