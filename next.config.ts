import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the site can be hosted anywhere (Vercel, Netlify, any static host).
  output: process.env.STATIC_EXPORT ? "export" : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  // "Work" was renamed to "Projects": keep old links working (ignored by the static export)
  async redirects() {
    return [
      { source: "/work", destination: "/projects/", permanent: true },
      { source: "/work/:path*", destination: "/projects/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
