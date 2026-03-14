import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  allowedDevOrigins: process.env["ALLOWED_DEV_ORIGINS"]
    ? process.env["ALLOWED_DEV_ORIGINS"].split(",")
    : undefined,
  devIndicators: false,
  output: "standalone",
  typescript: {
    // disables running tsc
    ignoreBuildErrors: true,
  },
};

export default process.env["ANALYZE"]
  ? bundleAnalyzer()(nextConfig)
  : nextConfig;
