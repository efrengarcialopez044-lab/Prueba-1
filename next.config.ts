import type { NextConfig } from "next";
import { CSP_HEADER } from "./lib/csp";

const nextConfig: NextConfig = {
  images: {
    // The admin can add property photos by URL from Configuración; next/image
    // proxies and re-optimizes them server-side, so the browser only ever
    // requests same-origin /_next/image URLs regardless of the source host.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP_HEADER },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
