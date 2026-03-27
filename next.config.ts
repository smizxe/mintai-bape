import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rafauyapzsakuhgrbmye.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
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
