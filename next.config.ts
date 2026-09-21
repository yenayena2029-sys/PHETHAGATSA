import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: '/images/:path*',
          destination: '/api/media/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
