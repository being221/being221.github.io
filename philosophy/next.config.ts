import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/philosophy",
  trailingSlash: true,
  pageExtensions: ["ts", "tsx"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
