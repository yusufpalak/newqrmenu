<template>
  <div>
    <!-- Header -->
    <AdminPageHeader title="QR Kod" description="Restoranın QR kodunu indir ve müşterilerinle paylaş." />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- QR Card -->
      <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-8 flex flex-col items-center">
        <div class="w-64 h-64 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-center mb-6">
          <ClientOnly>
            <QrcodeVue :value="qrUrl" :size="220" level="H" />
            <template #fallback>
              <div class="w-full h-full flex items-center justify-center text-slate-400 text-sm">Yükleniyor...</div>
            </template>
          </ClientOnly>
        </div>
        <p class="text-xs text-slate-400 mb-6 text-center break-all max-w-xs">{{ qrUrl }}</p>
        <button @click="downloadQR" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          QR Kodu İndir
        </button>
      </div>

      <!-- Info Card -->
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 class="font-semibold text-slate-700 mb-3">Menü Bağlantısı</h3>
          <div class="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <span class="text-sm text-slate-600 flex-1 break-all">{{ qrUrl }}</span>
            <a :href="qrUrl" target="_blank" class="flex-shrink-0 p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 class="font-semibold text-slate-700 mb-3">Kullanım Talimatları</h3>
          <ol class="space-y-2 text-sm text-slate-500">
            <li class="flex items-start gap-2">
              <span class="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">1</span>
              QR kodunu yüksek kalitede indir (PNG formatında)
            </li>
            <li class="flex items-start gap-2">
              <span class="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">2</span>
              Masalara veya menü standlarına yerleştir
            </li>
            <li class="flex items-start gap-2">
              <span class="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">3</span>
              Müşteriler QR kodu tarayarak dijital menüye erişir
            </li>
          </ol>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-amber-700">QR kod her zaman güncel menünü gösterir. Menüde değişiklik yaptığında QR kodu yeniden indirmene gerek yok.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import QrcodeVue from 'qrcode.vue';
definePageMeta({ layout: 'admin' });

const authStore = useAuthStore();
const qrUrl = computed(() => {
  if (process.client) {
    return `${window.location.origin}/${authStore.currentTenant?.slug || authStore.user?.tenant?.slug || 'restoran1'}`;
  }
  return '';
});

const downloadQR = () => {
  const canvas = document.querySelector('canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = `qr-${authStore.currentTenant?.slug || 'menu'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }
};
</script>
