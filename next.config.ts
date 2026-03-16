import type { NextConfig } from "next";

export default {
  allowedDevOrigins: process.env["ALLOWED_DEV_ORIGINS"]
    ? process.env["ALLOWED_DEV_ORIGINS"].split(",")
    : undefined,
  devIndicators: false,
  output: "standalone",
  typescript: {
    // disables running tsc
    ignoreBuildErrors: true,
  },
} satisfies NextConfig;
