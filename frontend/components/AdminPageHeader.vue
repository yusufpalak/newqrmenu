<template>
  <div class="mb-8 flex items-center justify-between gap-4 flex-wrap">
    <div class="flex items-center gap-4">
      <button
        @click="$router.back()"
        class="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
        title="Geri dön"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">{{ title }}</h1>
        <p v-if="description" class="text-sm text-slate-500 mt-0.5">{{ description }}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
});
</script>
