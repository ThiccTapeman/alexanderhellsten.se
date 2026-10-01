/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/*": ["./db/migrations/*.sql"],
  },
};

export default nextConfig;
