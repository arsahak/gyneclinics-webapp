import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Profile photos uploaded through the backend.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.digitaloceanspaces.com" },
    ],
  },
  experimental: {
    serverActions: {
      // Photo uploads go through a Server Action; the backend allows up to 5 MB.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
