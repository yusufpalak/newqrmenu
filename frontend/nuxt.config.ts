import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  routeRules: {
    '/admin/**': { ssr: false },
    '/': { ssr: true },
    '/en': { ssr: true },
    '/es': { ssr: true },
    '/ru': { ssr: true },
    '/de': { ssr: true },
    '/fr': { ssr: true },
    '/it': { ssr: true },
    '/about': { ssr: true },
    '/contact': { ssr: true },
    '/blog': { ssr: true },
    '/blog/**': { ssr: true },
    '/[tenantSlug]': { ssr: true },
  },

  runtimeConfig: {
    apiBase: process.env.NUXT_PRIVATE_API_BASE || 'http://backend:3001',
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
});
