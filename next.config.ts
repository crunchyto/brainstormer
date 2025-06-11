import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize images for Netlify deployment
  images: {
    unoptimized: true,
  },
  
  // TypeScript configuration
  typescript: {
    // Don't fail build on type errors in production
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration  
  eslint: {
    // Don't fail build on lint errors (warnings are OK)
    ignoreDuringBuilds: true,
  },
  
  // Enable experimental features for better performance
  experimental: {
    // Optimize imports
    optimizePackageImports: ['react', 'react-dom'],
  },
};

export default nextConfig;
