<template>
  <HomePage lang="tr" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { detectBrowserHomeLocale } from '~/composables/useHomeI18n';

definePageMeta({ layout: false });

// On first visit, if the visitor's browser language matches a non-default
// supported locale, redirect to its localized URL.
onMounted(() => {
  if (typeof window === 'undefined') return;
  try {
    const stored = window.localStorage.getItem('home-locale');
    if (stored) return;
    const detected = detectBrowserHomeLocale();
    if (detected !== 'tr') {
      window.localStorage.setItem('home-locale', detected);
      window.location.replace(`/${detected}`);
    }
  } catch {
    // ignore storage errors
  }
});
</script>
