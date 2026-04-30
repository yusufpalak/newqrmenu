<template>
  <div class="min-h-screen bg-slate-50">

    <!-- Hero -->
    <header class="bg-slate-900 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none"></div>

      <div class="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <p class="text-white font-semibold">{{ t.brand }}</p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Language switcher -->
          <div class="relative" ref="langMenuRef">
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-2 border border-white/20 text-slate-300 hover:text-white hover:border-white/40 rounded-lg text-sm font-medium transition"
              :aria-label="t.languageLabel"
              :aria-expanded="langOpen"
              @click="langOpen = !langOpen"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span class="uppercase">{{ lang }}</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-if="langOpen"
              class="absolute right-0 mt-2 w-44 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-20"
              role="menu"
            >
              <NuxtLink
                v-for="code in HOME_LOCALES"
                :key="code"
                :to="localePath(code)"
                class="flex items-center justify-between px-4 py-2.5 text-sm transition"
                :class="code === lang ? 'bg-indigo-500/20 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'"
                role="menuitem"
                @click="langOpen = false"
              >
                <span>{{ t.languageNames[code] }}</span>
                <span class="text-xs uppercase opacity-60">{{ code }}</span>
              </NuxtLink>
            </div>
          </div>

          <NuxtLink :to="lang === 'tr' ? '/about' : `/about?lang=${lang}`" class="hidden md:inline-block px-3 py-2 text-slate-300 hover:text-white text-sm font-medium transition">
            {{ t.nav.about }}
          </NuxtLink>
          <NuxtLink :to="lang === 'tr' ? '/blog' : `/blog?lang=${lang}`" class="hidden md:inline-block px-3 py-2 text-slate-300 hover:text-white text-sm font-medium transition">
            {{ t.nav.blog }}
          </NuxtLink>
          <NuxtLink :to="lang === 'tr' ? '/contact' : `/contact?lang=${lang}`" class="hidden md:inline-block px-3 py-2 text-slate-300 hover:text-white text-sm font-medium transition">
            {{ t.nav.contact }}
          </NuxtLink>

          <NuxtLink to="/admin/login" class="px-4 py-2 border border-white/20 text-slate-300 hover:text-white hover:border-white/40 rounded-lg text-sm font-medium transition">
            {{ t.nav.login }}
          </NuxtLink>
        </div>
      </div>

      <div class="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-28 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 mb-8">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          <p class="text-indigo-300 text-xs font-semibold tracking-widest uppercase">{{ t.hero.eyebrow }}</p>
        </div>
        <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
          {{ t.hero.titleLine1 }}<br />
          <span class="text-indigo-400">{{ t.hero.titleLine2 }}</span>
        </h1>
        <p class="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed mb-10">
          {{ t.hero.subtitle }}
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <NuxtLink to="/admin/login" class="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-indigo-500/25">
            {{ t.hero.primary }}
          </NuxtLink>
          <a href="/restoran1" class="px-6 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl font-medium text-sm transition">
            {{ t.hero.secondary }}
          </a>
        </div>
      </div>
    </header>

    <!-- Features -->
    <main class="max-w-6xl mx-auto px-6 py-20">
      <div class="text-center mb-14">
        <h2 class="text-2xl font-bold text-slate-800 mb-3">{{ t.features.title }}</h2>
        <p class="text-slate-500 text-sm max-w-md mx-auto">{{ t.features.subtitle }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          v-for="(feature, idx) in t.features.items"
          :key="idx"
          class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition"
        >
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            :class="featureIconBg[idx]"
          >
            <svg class="w-5 h-5" :class="featureIconColor[idx]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="featureIconPaths[idx]" />
            </svg>
          </div>
          <h3 class="font-semibold text-slate-800 mb-2">{{ feature.title }}</h3>
          <p class="text-slate-500 text-sm leading-relaxed">{{ feature.desc }}</p>
        </div>
      </div>
    </main>

    <!-- CTA -->
    <section class="bg-slate-900 relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.15)_0%,_transparent_70%)] pointer-events-none"></div>
      <div class="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">{{ t.cta.title }}</h2>
        <p class="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">{{ t.cta.subtitle }}</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <NuxtLink to="/admin/login" class="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-indigo-500/25">
            {{ t.cta.primary }}
          </NuxtLink>
          <a href="/restoran1" class="px-6 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl font-medium text-sm transition">
            {{ t.cta.secondary }}
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-900 border-t border-white/5 px-6 py-6">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <span class="text-slate-400 text-sm font-medium">{{ t.brand }}</span>
        </div>
        <p class="text-slate-600 text-xs">© {{ year }} · {{ t.footer.rights }}</p>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import {
  HOME_LOCALES,
  useHomeI18n,
  type HomeLocale,
} from '~/composables/useHomeI18n';

interface IProps {
  lang: HomeLocale;
}

const props = defineProps<IProps>();

const t = computed(() => useHomeI18n(props.lang));
const year = new Date().getFullYear();

const langOpen = ref<boolean>(false);
const langMenuRef = ref<HTMLElement | null>(null);

const localePath = (code: HomeLocale): string => (code === 'tr' ? '/' : `/${code}`);

const featureIconBg: string[] = [
  'bg-indigo-50',
  'bg-purple-50',
  'bg-emerald-50',
  'bg-amber-50',
  'bg-rose-50',
  'bg-sky-50',
];
const featureIconColor: string[] = [
  'text-indigo-500',
  'text-purple-500',
  'text-emerald-500',
  'text-amber-500',
  'text-rose-500',
  'text-sky-500',
];
const featureIconPaths: string[] = [
  'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
  'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
  'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
];

function onDocClick(event: MouseEvent): void {
  if (!langMenuRef.value) return;
  if (!langMenuRef.value.contains(event.target as Node)) langOpen.value = false;
}
onMounted(() => document.addEventListener('click', onDocClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));

// SEO: title/description + hreflang alternates + canonical + OG/Twitter
const SITE_URL = 'http://localhost:3003';
const canonicalPath = computed(() => localePath(props.lang));
const canonicalUrl = computed(() => `${SITE_URL}${canonicalPath.value === '/' ? '' : canonicalPath.value}`);

useHead({
  htmlAttrs: { lang: t.value.htmlLang, dir: 'ltr' },
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
    ...HOME_LOCALES.map((code) => ({
      rel: 'alternate',
      hreflang: code,
      href: `${SITE_URL}${code === 'tr' ? '/' : `/${code}`}`,
    })),
    { rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}/` },
  ],
});

useSeoMeta({
  title: t.value.metaTitle,
  description: t.value.metaDescription,
  ogTitle: t.value.metaTitle,
  ogDescription: t.value.metaDescription,
  ogType: 'website',
  ogUrl: canonicalUrl.value,
  ogLocale: t.value.ogLocale,
  twitterCard: 'summary_large_image',
  twitterTitle: t.value.metaTitle,
  twitterDescription: t.value.metaDescription,
  robots: 'index, follow',
});
</script>
