export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  routeRules: {
    '/admin/**': { ssr: false },
    '/[tenantSlug]': { ssr: true },
  },

  runtimeConfig: {
    // Server-side only (Docker internal)
    apiBase: process.env.NUXT_PRIVATE_API_BASE || 'http://backend:3001',
    // Client-side accessible (browser)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3002',
    },
  },

  app: {
    head: {
      title: 'QR Menu - Digital Restaurant Menu',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  compatibilityDate: '2024-01-01',
})
