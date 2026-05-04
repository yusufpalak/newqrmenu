<template>
  <footer
    class="text-center border-t border-stone-200/80 bg-gray-50 py-8 px-4"
    :class="compact ? 'py-5' : 'py-8'"
  >
    <a href="https://kernelasoft.com" target="_blank" rel="noopener noreferrer" class="inline-flex flex-col items-center gap-2 group">
      <div class="flex items-center gap-1.5 text-xs font-medium text-stone-400 group-hover:text-stone-600 transition-colors">
        <span>❤️ by</span>
        <span class="font-bold text-stone-500 group-hover:text-indigo-600 transition-colors">Kernelasoft</span>
      </div>
      <p class="text-[10px] text-stone-300 group-hover:text-stone-400">Dijital Menü Çözümleri</p>
    </a>
  </footer>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ compact?: boolean }>(),
  { compact: false },
);
</script>
