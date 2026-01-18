/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during builds (ESLint may have peer dependency issues)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Continue build even with TypeScript errors (if needed)
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig

