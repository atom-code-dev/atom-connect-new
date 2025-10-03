import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Remove standalone output for development
  // output: 'standalone',
  // Ensure proper asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Enable trailing slash for consistent routing
  trailingSlash: false,
  // Allow preview environment origins
  allowedDevOrigins: [
    'http://localhost:3000',
    'https://preview-chat-1625db6e-e070-49a4-96fa-b973f1d35ab0.space.z.ai',
    'https://preview-chat-f5b91986-2535-43cb-b29f-5d1934534ed5.space.z.ai'
  ],
};

export default nextConfig;
