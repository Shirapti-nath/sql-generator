import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  env: {
    // Set at build time on Vercel so the client always runs Python via Pyodide
    NEXT_PUBLIC_FORCE_BROWSER: process.env.VERCEL === "1" ? "1" : "0",
  },
};

export default nextConfig;
