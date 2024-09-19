/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BUILD_TIMESTAMP: String(Date.now()),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
