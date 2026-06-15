import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export',  // 部署到 GitHub Pages 时取消注释
  // basePath: '/shelf',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
