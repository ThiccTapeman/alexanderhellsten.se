/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["pg", "sharp"],
  outputFileTracingIncludes: {
    "/*": ["./db/migrations/*.sql"],
  },
};

export default nextConfig;
