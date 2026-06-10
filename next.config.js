/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true'

const imageRemotePatterns = [
  { protocol: 'https', hostname: '**.supabase.co' },
  { protocol: 'https', hostname: '**.supabase2.aidap-global.cn-beijing.volces.com' },
  { protocol: 'https', hostname: 'images.unsplash.com' },
]

const nextConfig = {
  ...(isGithubPages
    ? {
        output: 'export',
        basePath: '/meiyou-story-18-2',
        assetPrefix: '/meiyou-story-18-2/',
        trailingSlash: true,
      }
    : { output: 'standalone' }),
  /** 开发时关闭 webpack 持久化缓存，避免 HMR 后出现 Cannot find module './xxx.js' */
  webpack: (config, { dev }) => {
    if (dev) config.cache = false
    return config
  },
  images: {
    unoptimized: isGithubPages,
    remotePatterns: imageRemotePatterns,
  },
}

module.exports = nextConfig
