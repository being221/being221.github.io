import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/shelf',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
