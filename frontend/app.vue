<template>
  <div class="flex min-h-screen flex-col">
    <div class="flex min-h-0 flex-1 flex-col">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
    <KernelasoftFooter class="mt-auto shrink-0" />
  </div>
</template>

<script setup lang="ts">
</script>

<style>
body {
  @apply bg-gray-50;
  margin: 0;
  padding: 0;
}

/* Smooth animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
