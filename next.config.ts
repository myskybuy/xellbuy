import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.xellbuy.in" }],
        destination: "https://xellbuy.in/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
