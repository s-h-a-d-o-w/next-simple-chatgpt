/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    buildTimestamp: String(Date.now()),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
