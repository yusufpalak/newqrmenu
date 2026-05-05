<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <!-- Header -->
    <header class="bg-slate-900">
      <div class="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <NuxtLink :to="localizedPath('/', lang)" class="flex items-center gap-2.5">
          <div class="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <span class="text-white font-semibold tracking-tight">{{ home.brand }}</span>
        </NuxtLink>
        <nav class="flex items-center gap-1">
          <NuxtLink :to="localizedPath('/about', lang)" class="px-3 py-2 text-white text-sm font-medium">{{ home.nav.about }}</NuxtLink>
          <NuxtLink :to="localizedPath('/blog', lang)" class="px-3 py-2 text-slate-300 hover:text-white text-sm font-medium">{{ home.nav.blog }}</NuxtLink>
          <NuxtLink :to="localizedPath('/contact', lang)" class="px-3 py-2 text-slate-300 hover:text-white text-sm font-medium">{{ home.nav.contact }}</NuxtLink>
          <NuxtLink to="/admin/login" class="ml-2 px-4 py-2 border border-white/20 text-slate-300 hover:text-white hover:border-white/40 rounded-lg text-sm font-medium transition">{{ home.nav.login }}</NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Hero -->
    <section class="bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div class="max-w-4xl mx-auto px-6 py-20 text-center">
        <span class="inline-block px-3 py-1 text-xs uppercase tracking-wider bg-indigo-500/20 text-indigo-200 rounded-full mb-5">{{ t.heroEyebrow }}</span>
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-6">{{ t.heroTitle }}</h1>
        <p class="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">{{ t.heroSubtitle }}</p>
      </div>
    </section>

    <!-- Story -->
    <section class="px-6 py-20">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold mb-8">{{ t.storyTitle }}</h2>
        <div class="space-y-5 text-slate-700 leading-relaxed text-lg">
          <p>{{ t.storyP1 }}</p>
          <p>{{ t.storyP2 }}</p>
        </div>
      </div>
    </section>

    <!-- Mission/Vision -->
    <section class="bg-white px-6 py-20 border-y border-slate-200">
      <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        <div>
          <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h3 class="text-2xl font-bold mb-3">{{ t.missionTitle }}</h3>
          <p class="text-slate-700 leading-relaxed">{{ t.missionDesc }}</p>
        </div>
        <div>
          <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </div>
          <h3 class="text-2xl font-bold mb-3">{{ t.visionTitle }}</h3>
          <p class="text-slate-700 leading-relaxed">{{ t.visionDesc }}</p>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="px-6 py-20">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-3">{{ t.valuesTitle }}</h2>
          <p class="text-slate-600 max-w-2xl mx-auto">{{ t.valuesSubtitle }}</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(v, i) in t.values" :key="i" class="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition">
            <div class="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center mb-4 font-bold text-sm">{{ i + 1 }}</div>
            <h3 class="text-lg font-semibold mb-2">{{ v.title }}</h3>
            <p class="text-slate-600 text-sm leading-relaxed">{{ v.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-slate-900 text-white px-6 py-16">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">{{ t.ctaTitle }}</h2>
        <p class="text-slate-300 mb-8">{{ t.ctaSubtitle }}</p>
        <div class="flex items-center justify-center gap-3 flex-wrap">
          <NuxtLink to="/admin/login" class="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-medium text-sm transition">{{ t.ctaPrimary }}</NuxtLink>
          <NuxtLink :to="localizedPath('/contact', lang)" class="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl font-medium text-sm transition">{{ t.ctaSecondary }}</NuxtLink>
        </div>
      </div>
    </section>

    <footer class="bg-slate-950 text-slate-500 px-6 py-6 text-center text-xs">© {{ year }} · {{ home.brand }}</footer>
  </div>
</template>

<script setup lang="ts">
import { useHomeI18n } from '~/composables/useHomeI18n';
import { useAboutI18n } from '~/composables/usePagesI18n';
import {
  usePageLocale,
  localizedPath,
  buildCanonical,
  buildHreflangAlternates,
} from '~/composables/usePageLocale';

const { lang } = usePageLocale();
const t = computed(() => useAboutI18n(lang.value));
const home = computed(() => useHomeI18n(lang.value));
const year = new Date().getFullYear();

useSeoMeta({
  title: () => t.value.metaTitle,
  description: () => t.value.metaDescription,
  ogTitle: () => t.value.metaTitle,
  ogDescription: () => t.value.metaDescription,
  ogType: 'website',
  ogUrl: () => buildCanonical('/about', lang.value),
  twitterCard: 'summary_large_image',
});

useHead({
  htmlAttrs: { lang: () => home.value.htmlLang },
  link: [
    { rel: 'canonical', href: () => buildCanonical('/about', lang.value) },
    ...buildHreflangAlternates('/about'),
    { rel: 'alternate', hreflang: 'x-default', href: buildCanonical('/about', 'tr') },
  ],
});
</script>
