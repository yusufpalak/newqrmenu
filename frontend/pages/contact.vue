<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="bg-slate-900">
      <div class="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <NuxtLink :to="localizedPath('/', lang)" class="flex items-center gap-2.5">
          <div class="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <span class="text-white font-semibold tracking-tight">{{ home.brand }}</span>
        </NuxtLink>
        <nav class="flex items-center gap-1">
          <NuxtLink :to="localizedPath('/about', lang)" class="px-3 py-2 text-slate-300 hover:text-white text-sm font-medium">{{ home.nav.about }}</NuxtLink>
          <NuxtLink :to="localizedPath('/blog', lang)" class="px-3 py-2 text-slate-300 hover:text-white text-sm font-medium">{{ home.nav.blog }}</NuxtLink>
          <NuxtLink :to="localizedPath('/contact', lang)" class="px-3 py-2 text-white text-sm font-medium">{{ home.nav.contact }}</NuxtLink>
          <NuxtLink to="/admin/login" class="ml-2 px-4 py-2 border border-white/20 text-slate-300 hover:text-white hover:border-white/40 rounded-lg text-sm font-medium transition">{{ home.nav.login }}</NuxtLink>
        </nav>
      </div>
    </header>

    <section class="bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div class="max-w-4xl mx-auto px-6 py-20 text-center">
        <span class="inline-block px-3 py-1 text-xs uppercase tracking-wider bg-indigo-500/20 text-indigo-200 rounded-full mb-5">{{ t.heroEyebrow }}</span>
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-6">{{ t.heroTitle }}</h1>
        <p class="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">{{ t.heroSubtitle }}</p>
      </div>
    </section>

    <section class="px-6 py-16">
      <div class="max-w-5xl mx-auto grid md:grid-cols-5 gap-10">
        <!-- Form -->
        <div class="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-7">
          <h2 class="text-2xl font-bold mb-1">{{ t.formTitle }}</h2>
          <p class="text-slate-500 mb-6 text-sm">{{ t.formSubtitle }}</p>

          <div v-if="status === 'success'" class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <h3 class="font-semibold text-emerald-700">{{ t.successTitle }}</h3>
            <p class="text-sm text-emerald-700/80 mt-1">{{ t.successDesc }}</p>
          </div>
          <div v-if="status === 'error'" class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
            {{ errorMsg || t.errorGeneric }}
          </div>

          <form v-if="status !== 'success'" @submit.prevent="submit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">{{ t.fieldName }}</label>
              <input v-model="form.name" required minlength="2" maxlength="120" type="text" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">{{ t.fieldEmail }}</label>
              <input v-model="form.email" required type="email" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none" />
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">{{ t.fieldPhone }}</label>
                <input v-model="form.phone" type="tel" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">{{ t.fieldSubject }}</label>
                <input v-model="form.subject" type="text" maxlength="200" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">{{ t.fieldMessage }}</label>
              <textarea v-model="form.message" required minlength="5" maxlength="5000" rows="6" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none resize-y"></textarea>
            </div>
            <button :disabled="status === 'sending'" type="submit" class="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium text-sm transition">
              {{ status === 'sending' ? t.submitting : t.submit }}
            </button>
          </form>
        </div>

        <!-- Info -->
        <aside class="md:col-span-2 bg-slate-900 text-white rounded-2xl p-7">
          <h2 class="text-xl font-bold mb-6">{{ t.infoTitle }}</h2>
          <ul class="space-y-5 text-sm">
            <li>
              <div class="text-slate-400 text-xs uppercase tracking-wider mb-1">{{ t.infoEmail }}</div>
              <a :href="`mailto:${displayedEmail}`" class="text-white hover:text-indigo-300">{{ displayedEmail }}</a>
            </li>
            <li>
              <div class="text-slate-400 text-xs uppercase tracking-wider mb-1">{{ t.infoPhone }}</div>
              <a :href="`tel:${displayedPhone.replace(/\s/g,'')}`" class="text-white hover:text-indigo-300">{{ displayedPhone }}</a>
            </li>
            <li>
              <div class="text-slate-400 text-xs uppercase tracking-wider mb-1">{{ t.infoAddress }}</div>
              <div class="text-white">{{ displayedAddress }}</div>
            </li>
          </ul>
        </aside>
      </div>
    </section>

    <footer class="bg-slate-950 text-slate-500 px-6 py-6 text-center text-xs">© {{ year }} · {{ home.brand }}</footer>
  </div>
</template>

<script setup lang="ts">
import { useHomeI18n } from '~/composables/useHomeI18n';
import { useContactI18n } from '~/composables/usePagesI18n';
import {
  usePageLocale,
  localizedPath,
  buildCanonical,
  buildHreflangAlternates,
} from '~/composables/usePageLocale';
import type { ICreateContactMessage, IApiError, IContactSettings } from '~/types';

const { lang } = usePageLocale();
const t = computed(() => useContactI18n(lang.value));
const home = computed(() => useHomeI18n(lang.value));
const year = new Date().getFullYear();

const api = useApi();
const contactSettings = ref<IContactSettings | null>(null);

const form = ref<ICreateContactMessage>({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  locale: lang.value,
});
const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle');
const errorMsg = ref<string>('');

async function submit(): Promise<void> {
  status.value = 'sending';
  errorMsg.value = '';
  try {
    const payload: ICreateContactMessage = {
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      message: form.value.message.trim(),
      locale: lang.value,
    };
    if (form.value.phone) payload.phone = form.value.phone.trim();
    if (form.value.subject) payload.subject = form.value.subject.trim();
    await api.post<{ success: true }, ICreateContactMessage>('/contact', payload);
    status.value = 'success';
  } catch (err: unknown) {
    const apiErr = err as IApiError | undefined;
    errorMsg.value = Array.isArray(apiErr?.message) ? apiErr.message.join(', ') : (apiErr?.message ?? '');
    status.value = 'error';
  }
}

const displayedEmail = computed(() => contactSettings.value?.contactEmail || t.value.emailValue);
const displayedPhone = computed(() => contactSettings.value?.contactPhone || t.value.phoneValue);
const displayedAddress = computed(() => contactSettings.value?.contactAddress || t.value.addressValue);

const loadContactSettings = async (): Promise<void> => {
  try {
    contactSettings.value = await $fetch<IContactSettings>(`${useRuntimeConfig().public.apiBase}/api/public/settings/contact`);
  } catch {
    contactSettings.value = null;
  }
};

onMounted(() => {
  void loadContactSettings();
});

useSeoMeta({
  title: () => t.value.metaTitle,
  description: () => t.value.metaDescription,
  ogTitle: () => t.value.metaTitle,
  ogDescription: () => t.value.metaDescription,
  ogType: 'website',
  ogUrl: () => buildCanonical('/contact', lang.value),
  twitterCard: 'summary_large_image',
});

useHead({
  htmlAttrs: { lang: () => home.value.htmlLang },
  link: [
    { rel: 'canonical', href: () => buildCanonical('/contact', lang.value) },
    ...buildHreflangAlternates('/contact'),
    { rel: 'alternate', hreflang: 'x-default', href: buildCanonical('/contact', 'tr') },
  ],
});
</script>
