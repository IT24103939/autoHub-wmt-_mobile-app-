const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize Metro bundler for faster reloads
config.transformer = {
  ...config.transformer,
  // Use inline requires to reduce initial bundle size
  inlineRequires: true,
  // Minify in development for smaller files
  minify: false, // Set to true when building for production
};

// Reduce number of workers for better performance
config.maxWorkers = 2;

// Cache configuration for faster recompilation
config.projectRoot = __dirname;

module.exports = config;
