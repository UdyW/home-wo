import type { NextConfig } from "next";

// Static export: `npm run build` writes plain HTML, CSS and JS to out/. No server needed.
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
