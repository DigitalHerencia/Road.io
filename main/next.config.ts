import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable experimental CSS features for Tailwind CSS v4
    cssChunking: "strict",
  },
  // Ensure proper handling of CSS imports
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

export default nextConfig;
