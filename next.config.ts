import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Temporary changes as we move from axios to react-query */
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
