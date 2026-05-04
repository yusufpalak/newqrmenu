<template>
  <div>
    <!-- Tenant seçiliyken: restoran ayarları (ADMIN veya SUPERADMIN) -->
    <template v-if="authStore.isAdmin && authStore.currentTenant">
      <AdminPageHeader title="Ayarlar" description="Restoran bilgileri ve menü ayarlarını yönet." />

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

              <div class="flex items-center justify-between gap-4 pt-4 mt-1 border-t border-slate-100">
                <div class="min-w-0 pr-2">
                  <p class="text-sm font-medium text-slate-800">Fiyat güncelleme tarihi</p>
                  <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                    Açıkken müşteri menüsünde “fiyatlar en son … güncellenmiştir” satırı gösterilir. Kapalıyken bu not gizlenir (fiyatlar yine listelenir).
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="settings.showPriceUpdateDate"
                  @click="settings.showPriceUpdateDate = !settings.showPriceUpdateDate"
                  class="relative flex-shrink-0 h-8 w-14 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                  :class="settings.showPriceUpdateDate ? 'bg-indigo-600' : 'bg-slate-200'"
                >
                  <span
                    class="absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform"
                    :class="settings.showPriceUpdateDate ? 'translate-x-6' : 'translate-x-0'"
                  />
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
            <h3 class="font-semibold text-slate-700 mb-3">Restoran Bilgileri</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500">Restoran</span>
                <span class="font-medium text-slate-700">{{ authStore.currentTenant?.name || '—' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Slug</span>
                <span class="font-medium text-slate-600">{{ authStore.currentTenant?.slug || '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- SUPERADMIN: Global System Ayarları -->
    <template v-else-if="authStore.isSuperAdmin && !authStore.currentTenant">
      <AdminPageHeader title="Sistem Ayarları" description="Genel sistem ve platform ayarlarını yönet." />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Settings -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Platform Info -->
          <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 class="font-semibold text-slate-700 mb-5">Platform Bilgileri</h3>
            <div class="space-y-4">
              <div class="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p class="text-sm text-blue-800">
                  <svg class="inline w-4 h-4 mr-2 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  QR Menü platformu çoklu kiracı (multi-tenant) yapıdadır. Tüm global ayarlar otomatik yönetilir.
                </p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Toplam Tenant Sayısı</label>
                  <p class="text-3xl font-bold text-indigo-600">{{ totalTenants }}</p>
                </div>
                <div>
                  <label class="block text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Toplam Kullanıcı</label>
                  <p class="text-3xl font-bold text-emerald-600">{{ totalUsers }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Page Settings -->
          <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <div class="flex items-center justify-between gap-4 mb-4">
              <h3 class="font-semibold text-slate-700">İletişim Sayfası Bilgileri</h3>
              <span v-if="loadingContactSettings" class="text-xs text-slate-400">Yükleniyor...</span>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">İletişim E-postası</label>
                <input
                  v-model="globalContactSettings.contactEmail"
                  type="email"
                  placeholder="support@alanadiniz.com"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">İletişim Telefonu</label>
                <input
                  v-model="globalContactSettings.contactPhone"
                  type="text"
                  placeholder="+90 5xx xxx xx xx"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">İletişim Adresi</label>
                <input
                  v-model="globalContactSettings.contactAddress"
                  type="text"
                  placeholder="İstanbul, Türkiye"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm"
                />
              </div>
            </div>
            <div class="flex justify-end mt-5">
              <button
                @click="saveGlobalContactSettings"
                :disabled="savingGlobalContactSettings || loadingContactSettings"
                class="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50"
              >
                <svg v-if="savingGlobalContactSettings" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                İletişim Bilgilerini Kaydet
              </button>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 class="font-semibold text-slate-700 mb-4">Yönetim Sayfaları</h3>
            <div class="grid grid-cols-2 gap-3">
              <NuxtLink to="/admin/tenants" class="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-center">
                <svg class="w-5 h-5 text-indigo-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p class="text-sm font-medium text-slate-700">Tenantlar</p>
              </NuxtLink>
              <NuxtLink to="/admin/users" class="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-center">
                <svg class="w-5 h-5 text-indigo-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p class="text-sm font-medium text-slate-700">Kullanıcılar</p>
              </NuxtLink>
              <NuxtLink to="/admin/currencies" class="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-center">
                <svg class="w-5 h-5 text-emerald-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm font-medium text-slate-700">Para Birimleri</p>
              </NuxtLink>
              <NuxtLink to="/admin/blog" class="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-center">
                <svg class="w-5 h-5 text-amber-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p class="text-sm font-medium text-slate-700">Blog</p>
              </NuxtLink>
            </div>
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
                <span class="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium">{{ authStore.user?.role }}</span>
              </div>
            </div>
          </div>

          <div class="bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-5">
            <h3 class="font-semibold text-amber-900 mb-3">Global Mod</h3>
            <p class="text-xs text-amber-700 mb-3">
              Tenant seçilmemiş şekilde çalışıyorsunuz. Sistem genelindeki ayarları yönetebilirsiniz.
            </p>
            <NuxtLink to="/admin/select-tenant" class="block text-center px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition">
              Restoran Seç
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>

    <!-- No Access -->
    <template v-else>
      <div class="flex items-center justify-center min-h-96 bg-white rounded-xl border border-slate-200">
        <div class="text-center">
          <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p class="text-slate-600 font-medium">Erişim Reddedildi</p>
          <p class="text-sm text-slate-400 mt-1">Bu sayfaya erişim izniniz bulunmamaktadır.</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { IContactSettings } from '~/types';

definePageMeta({ layout: 'admin' });

const authStore = useAuthStore();
const api = useApi();
const saving = ref(false);
const totalTenants = ref(0);
const totalUsers = ref(0);
const loadingContactSettings = ref(false);
const savingGlobalContactSettings = ref(false);

const settings = ref({
  restaurantName: '',
  showPriceUpdateDate: true,
});

const globalContactSettings = ref<IContactSettings>({
  contactEmail: 'support@qrmenu.com',
  contactPhone: '+90 (555) 555 55 55',
  contactAddress: 'Istanbul, Türkiye',
});

const saveSettings = async () => {
  if (!authStore.currentTenant?.id) return;
  saving.value = true;
  try {
    const updated = await api.patch(`/tenants/${authStore.currentTenant.id}`, {
      name: settings.value.restaurantName,
      showPriceUpdateDate: settings.value.showPriceUpdateDate,
    });
    authStore.setTenant(updated);
    alert('Ayarlar kaydedildi.');
  } catch (e) {
    alert('Ayarlar kaydedilemedi.');
  } finally {
    saving.value = false;
  }
};

const loadGlobalStats = async () => {
  try {
    const tenants = await api.get<any[]>('/tenants');
    const users = await api.get<any[]>('/users');
    totalTenants.value = tenants.length;
    totalUsers.value = users.length;
  } catch (e) {
    console.error('Sistem istatistikleri yüklenemedi', e);
  }
};

const loadGlobalContactSettings = async () => {
  loadingContactSettings.value = true;
  try {
    const data = await api.get<IContactSettings>('/settings/contact');
    globalContactSettings.value = data;
  } catch (e) {
    console.error('İletişim ayarları yüklenemedi', e);
  } finally {
    loadingContactSettings.value = false;
  }
};

const saveGlobalContactSettings = async () => {
  savingGlobalContactSettings.value = true;
  try {
    globalContactSettings.value = await api.patch<IContactSettings, IContactSettings>(
      '/settings/contact',
      globalContactSettings.value,
    );
    alert('İletişim bilgileri kaydedildi.');
  } catch (e) {
    alert('İletişim bilgileri kaydedilemedi.');
  } finally {
    savingGlobalContactSettings.value = false;
  }
};

onMounted(() => {
  const t = authStore.currentTenant;
  if (t) {
    settings.value.restaurantName = t.name || '';
    settings.value.showPriceUpdateDate = t.showPriceUpdateDate !== false;
  }

  if (authStore.isSuperAdmin && !authStore.currentTenant) {
    loadGlobalStats();
    loadGlobalContactSettings();
  }
});
</script>
