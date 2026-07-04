import type { NextConfig } from "next";

export default {
  allowedDevOrigins: process.env["AUTH_URL"]
    ? [new URL(process.env["AUTH_URL"]).hostname]
    : undefined,
  devIndicators: false,
  output: "standalone",
  typescript: {
    // disables running tsc
    ignoreBuildErrors: true,
  },
} satisfies NextConfig;
