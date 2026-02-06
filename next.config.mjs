/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 优化图片
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },

  // 输出配置
  output: 'standalone',

  // 压缩
  compress: true,

  // 性能优化
  poweredByHeader: false,
  
  // 实验性功能
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
