import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inferred from NextConfig['webpack'] rather than importing Webpack's own
  // Configuration type — Next bundles webpack internally and doesn't expose
  // it as a resolvable top-level package for consumers to import types from.
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;
