import bundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default process.env.ANALYZE === "true"
  ? bundleAnalyzer()(nextConfig)
  : nextConfig;
