<template>
  <div class="min-h-screen bg-white text-slate-900">
    <header class="bg-slate-900">
      <div class="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <NuxtLink :to="localizedPath('/', lang)" class="flex items-center gap-2.5">
          <div class="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          </div>
          <span class="text-white font-semibold tracking-tight">QR Menu</span>
        </NuxtLink>
        <nav class="flex items-center gap-1">
          <NuxtLink :to="localizedPath('/about', lang)" class="px-3 py-2 text-slate-300 hover:text-white text-sm font-medium">{{ home.nav.about }}</NuxtLink>
          <NuxtLink :to="localizedPath('/blog', lang)" class="px-3 py-2 text-white text-sm font-medium">{{ home.nav.blog }}</NuxtLink>
          <NuxtLink :to="localizedPath('/contact', lang)" class="px-3 py-2 text-slate-300 hover:text-white text-sm font-medium">{{ home.nav.contact }}</NuxtLink>
          <NuxtLink to="/admin/login" class="ml-2 px-4 py-2 border border-white/20 text-slate-300 hover:text-white hover:border-white/40 rounded-lg text-sm font-medium transition">{{ home.nav.login }}</NuxtLink>
        </nav>
      </div>
    </header>

    <article v-if="post && tr" class="max-w-3xl mx-auto px-6 py-14">
      <NuxtLink :to="localizedPath('/blog', lang)" class="text-indigo-600 text-sm hover:underline">{{ t.backToList }}</NuxtLink>

      <h1 class="text-3xl md:text-5xl font-bold tracking-tight mt-5 mb-4 leading-tight">{{ tr.title }}</h1>
      <div class="flex items-center gap-4 text-sm text-slate-500 mb-8">
        <span>{{ t.publishedOn }} {{ formatDate(post.publishedAt) }}</span>
        <span aria-hidden="true">·</span>
        <span>{{ post.viewCount }} {{ t.views }}</span>
      </div>

      <img v-if="post.coverImage" :src="post.coverImage" :alt="tr.title" class="w-full rounded-2xl mb-10 object-cover" />

      <div class="prose prose-slate prose-lg max-w-none" v-html="tr.content"></div>

      <div v-if="post.tags" class="mt-10 pt-6 border-t border-slate-200">
        <div class="text-xs uppercase tracking-wider text-slate-500 mb-2">{{ t.tagsLabel }}</div>
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in tagsList" :key="tag" class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">{{ tag }}</span>
        </div>
      </div>
    </article>

    <div v-else-if="!pending" class="max-w-3xl mx-auto px-6 py-20 text-center">
      <h1 class="text-3xl font-bold mb-3">{{ t.notFoundTitle }}</h1>
      <p class="text-slate-500 mb-6">{{ t.notFoundDesc }}</p>
      <NuxtLink :to="localizedPath('/blog', lang)" class="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium">{{ t.backToList }}</NuxtLink>
    </div>

    <footer class="bg-slate-950 text-slate-500 px-6 py-6 text-center text-xs mt-16">© {{ year }} · QR Menu</footer>
  </div>
</template>

<script setup lang="ts">
import { useHomeI18n } from '~/composables/useHomeI18n';
import { useBlogI18n } from '~/composables/usePagesI18n';
import {
  usePageLocale,
  localizedPath,
  SITE_URL,
} from '~/composables/usePageLocale';
import { HOME_LOCALES, type HomeLocale } from '~/composables/useHomeI18n';
import type { IBlogPost, IBlogTranslation } from '~/types';

const route = useRoute();
const { lang } = usePageLocale();
const t = computed(() => useBlogI18n(lang.value));
const home = computed(() => useHomeI18n(lang.value));
const year = new Date().getFullYear();

const slugParam = computed<string>(() => String(route.params.slug ?? ''));

const config = useRuntimeConfig();
const apiBase = computed<string>(() => {
  if (process.server) return (config.apiBase as string) || (config.public.apiBase as string);
  return config.public.apiBase as string;
});

const { data: post, pending } = await useAsyncData<IBlogPost | null>(
  () => `blog-post-${slugParam.value}-${lang.value}`,
  async () => {
    try {
      return await $fetch<IBlogPost>(
        `${apiBase.value}/api/blog/public/${encodeURIComponent(slugParam.value)}?locale=${lang.value}`,
      );
    } catch {
      return null;
    }
  },
  { watch: [lang, slugParam] },
);

const tr = computed<IBlogTranslation | null>(() => {
  if (!post.value) return null;
  return (
    post.value.translations?.find((x) => x.locale === lang.value) ??
    post.value.translations?.find((x) => x.locale === post.value!.sourceLocale) ??
    post.value.translations?.[0] ??
    null
  );
});

const tagsList = computed<string[]>(() =>
  (post.value?.tags ?? '').split(',').map((s) => s.trim()).filter(Boolean),
);

function findTrSlug(p: IBlogPost, code: HomeLocale): string {
  return p.translations?.find((x) => x.locale === code)?.slug ?? p.slug;
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

const canonicalUrl = computed<string>(() =>
  post.value
    ? `${SITE_URL}${localizedPath(`/blog/${findTrSlug(post.value, lang.value)}`, lang.value)}`
    : `${SITE_URL}${localizedPath(`/blog/${slugParam.value}`, lang.value)}`,
);

useSeoMeta({
  title: () => tr.value?.metaTitle || tr.value?.title || t.value.metaTitle,
  description: () =>
    tr.value?.metaDescription || tr.value?.excerpt || t.value.metaDescription,
  ogTitle: () => tr.value?.metaTitle || tr.value?.title || t.value.metaTitle,
  ogDescription: () =>
    tr.value?.metaDescription || tr.value?.excerpt || t.value.metaDescription,
  ogType: 'article',
  ogImage: () => post.value?.coverImage || undefined,
  ogUrl: () => canonicalUrl.value,
  twitterCard: 'summary_large_image',
  articlePublishedTime: () => post.value?.publishedAt || undefined,
  articleModifiedTime: () => post.value?.updatedAt || undefined,
});

useHead({
  htmlAttrs: { lang: () => home.value.htmlLang },
  link: () => {
    const links: Array<Record<string, string>> = [
      { rel: 'canonical', href: canonicalUrl.value },
    ];
    if (post.value) {
      for (const code of HOME_LOCALES) {
        links.push({
          rel: 'alternate',
          hreflang: code,
          href: `${SITE_URL}${localizedPath(`/blog/${findTrSlug(post.value, code)}`, code)}`,
        });
      }
      links.push({
        rel: 'alternate',
        hreflang: 'x-default',
        href: `${SITE_URL}${localizedPath(`/blog/${findTrSlug(post.value, 'tr')}`, 'tr')}`,
      });
    }
    return links;
  },
  script: () =>
    post.value && tr.value
      ? [
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: tr.value.title,
              description: tr.value.excerpt || tr.value.metaDescription || '',
              image: post.value.coverImage || undefined,
              datePublished: post.value.publishedAt,
              dateModified: post.value.updatedAt,
              inLanguage: lang.value,
              mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl.value },
              publisher: {
                '@type': 'Organization',
                name: 'QR Menu',
                url: SITE_URL,
              },
            }),
          },
        ]
      : [],
});
</script>

<style scoped>
:deep(.prose img) { border-radius: 1rem; }
</style>
