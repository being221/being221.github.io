import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // basePath: '/shelf',  // 部署时取消注释
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
