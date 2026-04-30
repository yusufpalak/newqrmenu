<template>
  <div>
    <!-- Header -->
    <AdminPageHeader title="Ayarlar" description="Restoran bilgileri ve genel sistem ayarlarını yönet." />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Settings -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Restaurant Info -->
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 class="font-semibold text-slate-700 mb-5">Restoran Bilgileri</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Restoran Adı</label>
              <input v-model="settings.restaurantName" type="text" placeholder="Restoran adı"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Adres</label>
              <textarea v-model="settings.address" rows="2" placeholder="Restoran adresi"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm resize-none"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Telefon</label>
                <input v-model="settings.phone" type="tel" placeholder="+90 555 000 00 00"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">E-posta</label>
                <input v-model="settings.email" type="email" placeholder="info@restoran.com"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
              </div>
            </div>
          </div>
        </div>

        <!-- Menu Settings -->
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 class="font-semibold text-slate-700 mb-5">Menü Ayarları</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition">
              <div>
                <p class="text-sm font-medium text-slate-700">Besin değerlerini göster</p>
                <p class="text-xs text-slate-400 mt-0.5">Menüde kalori ve besin bilgisi gösterilsin</p>
              </div>
              <button type="button" @click="settings.showNutrition = !settings.showNutrition"
                :class="settings.showNutrition ? 'bg-indigo-500' : 'bg-slate-300'"
                class="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0">
                <span :class="settings.showNutrition ? 'translate-x-5' : 'translate-x-1'"
                  class="absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"></span>
              </button>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition">
              <div>
                <p class="text-sm font-medium text-slate-700">Alerjenleri göster</p>
                <p class="text-xs text-slate-400 mt-0.5">Ürün kartlarında alerjen bilgisi gösterilsin</p>
              </div>
              <button type="button" @click="settings.showAllergens = !settings.showAllergens"
                :class="settings.showAllergens ? 'bg-indigo-500' : 'bg-slate-300'"
                class="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0">
                <span :class="settings.showAllergens ? 'translate-x-5' : 'translate-x-1'"
                  class="absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"></span>
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button @click="saveSettings" :disabled="saving" class="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50">
            <svg v-if="saving" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Ayarları Kaydet
          </button>
        </div>
      </div>

      <!-- Side Info -->
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 class="font-semibold text-slate-700 mb-3">Hesap Bilgileri</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500">Ad</span>
              <span class="font-medium text-slate-700">{{ authStore.user?.name || '—' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">E-posta</span>
              <span class="font-medium text-slate-700 truncate ml-2">{{ authStore.user?.email || '—' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Rol</span>
              <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">{{ authStore.user?.role || '—' }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 class="font-semibold text-slate-700 mb-3">Tenant Bilgileri</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500">Restoran</span>
              <span class="font-medium text-slate-700">{{ authStore.currentTenant?.name || 'Seçilmedi' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Slug</span>
              <span class="font-medium text-slate-600">{{ authStore.currentTenant?.slug || '—' }}</span>
            </div>
          </div>
          <NuxtLink to="/admin/select-tenant" class="mt-4 block text-center px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition">
            Tenant Değiştir
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });

const authStore = useAuthStore();
const saving = ref(false);

const settings = ref({
  restaurantName: '',
  address: '',
  phone: '',
  email: '',
  showNutrition: true,
  showAllergens: true,
});

const saveSettings = async () => {
  saving.value = true;
  await new Promise(r => setTimeout(r, 800));
  saving.value = false;
  alert('Ayarlar kaydedildi.');
};

onMounted(() => {
  settings.value.restaurantName = authStore.currentTenant?.name || '';
});
</script>
