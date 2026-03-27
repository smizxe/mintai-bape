import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/account",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/accounts",
        destination: "/products",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
