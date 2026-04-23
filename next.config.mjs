/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
  transpilePackages: ["@react-pdf/renderer"],
};
export default nextConfig;
