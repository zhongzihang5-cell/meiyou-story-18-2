/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  /** 开发时关闭 webpack 持久化缓存，避免 HMR 后出现 Cannot find module './xxx.js' */
  webpack: (config, { dev }) => {
    if (dev) config.cache = false
    return config
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase2.aidap-global.cn-beijing.volces.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

module.exports = nextConfig
