/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['t.me', 'images.unsplash.com'],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    NEXT_PUBLIC_TELEGRAM_BOT_NAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'YourTaskTrackerBot',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Исключаем серверные модули из клиентской сборки
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
      
      // Исключаем нативные модули из клиентской сборки
      config.externals = config.externals || {}
      config.externals['better-sqlite3'] = 'commonjs better-sqlite3'
      config.externals['drizzle-orm/better-sqlite3'] = 'commonjs drizzle-orm/better-sqlite3'
      config.externals['drizzle-orm/better-sqlite3/migrator'] = 'commonjs drizzle-orm/better-sqlite3/migrator'
      config.externals['drizzle-orm/migrator'] = 'commonjs drizzle-orm/migrator'
    }
    return config
  },
}

module.exports = nextConfig