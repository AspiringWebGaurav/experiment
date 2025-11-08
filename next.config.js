/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  transpilePackages: ["next-themes"],

  // Optimize chunk loading and prevent errors
  experimental: {
    // Optimize package imports to reduce chunk size
    optimizePackageImports: ["lucide-react", "react-icons", "motion"],
  },

  // Production optimizations
  ...(process.env.NODE_ENV === "production" && {
    compress: true,
    poweredByHeader: false,
    generateEtags: true,
  }),

  // Headers for better caching and security
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
