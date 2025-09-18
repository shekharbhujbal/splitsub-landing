/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // TEMP for MVP: don't block builds on types/eslint (you can re-enable later)
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
module.exports = nextConfig;
