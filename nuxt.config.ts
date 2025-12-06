// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/hints', '@nuxtjs/supabase'],

  ssr: false,

  devtools: {
    enabled: true
  },
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      youtubeApiKey: process.env.NUXT_YOUTUBE_API_KEY,
      supabase: {
        url: process.env.NUXT_SUPABASE_URL,
        key: process.env.NUXT_SUPABASE_KEY
      }
    }
  },

  routeRules: {
    '/': { prerender: true }
  },
  compatibilityDate: '2025-01-15',

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  supabase: {
    redirect: false,
    types: '~/types/database.types.ts'
  }
})
