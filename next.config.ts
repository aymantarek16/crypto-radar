import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com",
        port: "",
        pathname: "/coins/images/**",
      },
    ],
  },

  // reactStrictMode: true,
}

export default nextConfig
