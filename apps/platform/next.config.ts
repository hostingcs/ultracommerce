import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: [
    "@ultra/api-contracts",
    "@ultra/core",
    "@ultra/db",
    "@ultra/modules",
    "@ultra/ui",
  ],
  async headers() {
    return [
      {
        source: "/api/v1/store/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.STOREFRONT_ORIGIN ?? "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Idempotency-Key",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
