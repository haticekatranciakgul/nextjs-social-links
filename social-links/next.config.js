/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Development overlay'i kapat
    appDir: true,
  },
  // Error overlay'i kapat
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Development indicators'ı kapat
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'top-right',
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