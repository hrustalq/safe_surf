/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Exclude problematic binary modules from webpack bundling
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude SSH-related binary modules from server-side bundling
      config.externals = config.externals || [];
      config.externals.push({
        'node-ssh': 'commonjs node-ssh',
        'ssh2': 'commonjs ssh2',
        'cpu-features': 'commonjs cpu-features',
        'bufferutil': 'commonjs bufferutil',
        'utf-8-validate': 'commonjs utf-8-validate',
      });
    }
    
    return config;
  },

  // Add fallbacks for browser environments
  experimental: {
    esmExternals: 'loose',
  },
  
  // Suppress warnings for known binary modules
  transpilePackages: [],
  
  // Images configuration
  images: {
    domains: [],
  },
};

export default config;
