import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "phim.nguonc.com",
      },
      {
        protocol: "https",
        hostname: "img.phimapi.com",
      },
      {
        protocol: "https",
        hostname: "img.ophim.live",
      },
      {
        protocol: "https",
        hostname: "phimimg.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
