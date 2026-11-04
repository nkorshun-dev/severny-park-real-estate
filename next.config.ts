import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/severny-park",
  images: { unoptimized: true },
};

export default nextConfig;
