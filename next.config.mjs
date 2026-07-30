/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site — deployable to Vercel (or any static host)
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // don't let lint/type warnings block the Vercel build
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
