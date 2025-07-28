const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: false,
};

export default process.env.ANALYZE === "true"
  ? (await import("@next/bundle-analyzer")).default()(nextConfig)
  : nextConfig;
