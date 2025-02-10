const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default process.env.ANALYZE === "true"
  ? (await import("@next/bundle-analyzer")).default()(nextConfig)
  : nextConfig;
