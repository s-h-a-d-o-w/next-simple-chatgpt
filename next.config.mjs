const nextConfig = {
  devIndicators: false,
  output: "standalone",
};

export default process.env.ANALYZE === "true"
  ? (await import("@next/bundle-analyzer")).default()(nextConfig)
  : nextConfig;
