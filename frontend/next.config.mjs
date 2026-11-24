/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow rewrites if needed for backend proxy
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
