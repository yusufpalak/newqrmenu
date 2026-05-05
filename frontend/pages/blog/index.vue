<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="bg-slate-900">
      <div class="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <NuxtLink :to="localizedPath('/', lang)" class="flex items-center gap-2.5">
          <div class="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          </div>
          <span class="text-white font-semibold tracking-tight">{{ home.brand }}</span>
        </NuxtLink>
        <nav class="flex items-center gap-1">
          <NuxtLink :to="localizedPath('/about', lang)" class="px-3 py-2 text-slate-300 hover:text-white text-sm font-medium">{{ home.nav.about }}</NuxtLink>
          <NuxtLink :to="localizedPath('/blog', lang)" class="px-3 py-2 text-white text-sm font-medium">{{ home.nav.blog }}</NuxtLink>
          <NuxtLink :to="localizedPath('/contact', lang)" class="px-3 py-2 text-slate-300 hover:text-white text-sm font-medium">{{ home.nav.contact }}</NuxtLink>
          <NuxtLink to="/admin/login" class="ml-2 px-4 py-2 border border-white/20 text-slate-300 hover:text-white hover:border-white/40 rounded-lg text-sm font-medium transition">{{ home.nav.login }}</NuxtLink>
        </nav>
      </div>
    </header>

    <section class="bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div class="max-w-4xl mx-auto px-6 py-16 text-center">
        <span class="inline-block px-3 py-1 text-xs uppercase tracking-wider bg-indigo-500/20 text-indigo-200 rounded-full mb-5">{{ t.heroEyebrow }}</span>
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-5">{{ t.heroTitle }}</h1>
        <p class="text-lg text-slate-300">{{ t.heroSubtitle }}</p>
      </div>
    </section>

    <section class="px-6 py-14">
      <div class="max-w-6xl mx-auto">
        <div v-if="pending" class="text-center py-20 text-slate-500">…</div>
        <div v-else-if="!posts || posts.length === 0" class="text-center py-20">
          <h2 class="text-2xl font-bold mb-2">{{ t.emptyTitle }}</h2>
          <p class="text-slate-500">{{ t.emptyDesc }}</p>
        </div>
        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          <NuxtLink
            v-for="post in posts"
            :key="post.id"
            :to="localizedPath(`/blog/${displaySlug(post)}`, lang)"
            class="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition"
          >
            <div class="aspect-video bg-slate-100 overflow-hidden">
              <img v-if="post.coverImage" :src="post.coverImage" :alt="displayTitle(post)" class="w-full h-full object-cover group-hover:scale-[1.03] transition" />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-300 text-5xl">📰</div>
            </div>
            <div class="p-5">
              <div class="text-xs text-slate-500 mb-2">{{ t.publishedOn }} {{ formatDate(post.publishedAt) }}</div>
              <h2 class="font-bold text-lg leading-snug mb-2 group-hover:text-indigo-600 transition line-clamp-2">{{ displayTitle(post) }}</h2>
              <p class="text-slate-600 text-sm line-clamp-3">{{ displayExcerpt(post) }}</p>
              <span class="inline-block mt-4 text-indigo-600 text-sm font-medium">{{ t.readMore }} →</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <footer class="bg-slate-950 text-slate-500 px-6 py-6 text-center text-xs">© {{ year }} · {{ home.brand }}</footer>
  </div>
</template>

<script setup lang="ts">
import { useHomeI18n } from '~/composables/useHomeI18n';
import { useBlogI18n } from '~/composables/usePagesI18n';
import {
  usePageLocale,
  localizedPath,
  buildCanonical,
  buildHreflangAlternates,
} from '~/composables/usePageLocale';
import type { IBlogPost } from '~/types';

const { lang } = usePageLocale();
const t = computed(() => useBlogI18n(lang.value));
const home = computed(() => useHomeI18n(lang.value));
const year = new Date().getFullYear();

const config = useRuntimeConfig();
const apiBase = computed<string>(() => {
  // Server-side fetch hits internal Docker URL; client uses public.
  if (process.server) return (config.apiBase as string) || (config.public.apiBase as string);
  return config.public.apiBase as string;
});

const { data: posts, pending } = await useAsyncData<IBlogPost[]>(
  () => `blog-list-${lang.value}`,
  () => $fetch<IBlogPost[]>(`${apiBase.value}/api/blog/public?locale=${lang.value}`),
  { watch: [lang] },
);

function pickTr(p: IBlogPost) {
  return p.translations?.find((x) => x.locale === lang.value) ?? p.translations?.[0];
}
function displayTitle(p: IBlogPost): string {
  return pickTr(p)?.title ?? p.slug;
}
function displayExcerpt(p: IBlogPost): string {
  return pickTr(p)?.excerpt ?? '';
}
function displaySlug(p: IBlogPost): string {
  return pickTr(p)?.slug ?? p.slug;
}
function formatDate(s: string | null): string {
  if (!s) return '';
  try {
    return new Date(s).toLocaleDateString(home.value.htmlLang || 'tr', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return s;
  }
}

useSeoMeta({
  title: () => t.value.metaTitle,
  description: () => t.value.metaDescription,
  ogTitle: () => t.value.metaTitle,
  ogDescription: () => t.value.metaDescription,
  ogType: 'website',
  ogUrl: () => buildCanonical('/blog', lang.value),
  twitterCard: 'summary_large_image',
});

useHead({
  htmlAttrs: { lang: () => home.value.htmlLang },
  link: [
    { rel: 'canonical', href: () => buildCanonical('/blog', lang.value) },
    ...buildHreflangAlternates('/blog'),
    { rel: 'alternate', hreflang: 'x-default', href: buildCanonical('/blog', 'tr') },
  ],
});
</script>

<style scoped>
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
</style>
