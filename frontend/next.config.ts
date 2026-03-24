import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  assetPrefix: "/static",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
