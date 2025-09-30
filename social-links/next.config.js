/** @type {import('next').NextConfig} */
const nextConfig = {
  // Error overlay'i kapat
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Development indicators'ı kapat
  devIndicators: {
    position: 'bottom-left',
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };
    return config;
  },
};

module.exports = nextConfig;