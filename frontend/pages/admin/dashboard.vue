<template>
  <div>
    <!-- SuperAdmin Global Mode Banner -->
    <div v-if="authStore.isSuperAdmin && !authStore.currentTenant" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-amber-800">Global Mod — Tenant seçilmedi</p>
          <p class="text-xs text-amber-600">Tenantlar, kullanıcılar ve sistem ayarlarını yönetebilirsin.</p>
        </div>
      </div>
      <NuxtLink to="/admin/select-tenant" class="text-sm font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2">
        Restoran seç →
      </NuxtLink>
    </div>

    <!-- Welcome Banner -->
    <div class="mb-8 bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
      <div class="absolute inset-0 opacity-5">
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full"></div>
        <div class="absolute -bottom-20 -left-20 w-48 h-48 bg-white rounded-full"></div>
      </div>
      <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-slate-400 text-sm mb-1">Hoşgeldin</p>
          <h1 class="text-3xl font-bold">{{ authStore.user?.name?.split(' ')[0] || 'Kullanıcı' }}</h1>
          <p class="text-slate-400 mt-1 text-sm">
            <span v-if="authStore.currentTenant">{{ authStore.currentTenant.name }} · </span>
            <span class="inline-block px-2 py-0.5 bg-white/10 rounded text-xs font-medium">{{ authStore.user?.role }}</span>
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button @click="logout" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition">
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>

    <!-- SuperAdmin Global Mode: Tenant List -->
    <template v-if="authStore.isSuperAdmin && !authStore.currentTenant">
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-800">Restoranlar</h2>
          <NuxtLink to="/admin/tenants" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Tümünü yönet →</NuxtLink>
        </div>
        <div v-if="loadingTenants" class="flex justify-center py-8">
          <div class="animate-spin h-8 w-8 border-4 border-slate-200 border-t-indigo-500 rounded-full"></div>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="t in tenants"
            :key="t.id"
            @click="switchToTenant(t)"
            class="p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all text-left group"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-slate-800 group-hover:text-indigo-700">{{ t.name }}</h3>
                <p class="text-xs text-slate-400 mt-0.5">{{ t.slug }}</p>
              </div>
              <a :href="`/${t.slug}`" target="_blank" @click.stop class="text-slate-300 hover:text-indigo-500 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </button>
          <NuxtLink to="/admin/tenants" class="p-5 bg-slate-50 border border-dashed border-slate-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="text-sm font-medium">Yeni Restoran</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Global Quick Links -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink to="/admin/users" class="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition text-center group">
          <div class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-indigo-100 transition">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-slate-700">Kullanıcılar</p>
        </NuxtLink>
        <NuxtLink to="/admin/currencies" class="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition text-center group">
          <div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-emerald-100 transition">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-slate-700">Para Birimleri</p>
        </NuxtLink>
        <NuxtLink to="/admin/translation-requests" class="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition text-center group">
          <div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-100 transition">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <p class="text-sm font-medium text-slate-700">Çeviriler</p>
        </NuxtLink>
        <NuxtLink to="/admin/tenants" class="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition text-center group">
          <div class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-amber-100 transition">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p class="text-sm font-medium text-slate-700">Tenantlar</p>
        </NuxtLink>
      </div>
    </template>

    <!-- Normal tenant mode: Stats + Quick Actions -->
    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Kategoriler</p>
          <p class="text-3xl font-bold text-slate-800">{{ stats.categories }}</p>
        </div>
        <div class="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Ürünler</p>
          <p class="text-3xl font-bold text-slate-800">{{ stats.products }}</p>
        </div>
        <div class="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Kullanıcılar</p>
          <p class="text-3xl font-bold text-slate-800">{{ stats.users }}</p>
        </div>
        <div class="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Menü Önizleme</p>
          <a
            :href="`/${authStore.currentTenant?.slug || authStore.user?.tenant?.slug}`"
            target="_blank"
            class="mt-auto block text-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
          >
            Menüyü Aç →
          </a>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h2 class="text-base font-semibold text-slate-700 mb-5">Hızlı Erişim</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <NuxtLink to="/admin/products" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition group">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-700">Ürünler</span>
          </NuxtLink>
          <NuxtLink to="/admin/categories" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition group">
            <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-700">Kategoriler</span>
          </NuxtLink>
          <NuxtLink to="/admin/sub-categories" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition group">
            <div class="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-pink-200 transition">
              <svg class="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-700">Alt Kategoriler</span>
          </NuxtLink>
          <NuxtLink to="/admin/currencies" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition group">
            <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-200 transition">
              <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-700">Para Birimleri</span>
          </NuxtLink>
          <NuxtLink to="/admin/users" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition group">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition">
              <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-700">Kullanıcılar</span>
          </NuxtLink>
          <NuxtLink to="/admin/qr-code" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition group">
            <div class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition">
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-700">QR Kod</span>
          </NuxtLink>
          <NuxtLink v-if="authStore.isSuperAdmin" to="/admin/tenants" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition group">
            <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition">
              <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-700">Tenantlar</span>
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' });

const authStore = useAuthStore();
const api = useApi();
const router = useRouter();

const stats = ref({ categories: 0, products: 0, users: 0 });
const tenants = ref([]);
const loadingTenants = ref(false);

const switchToTenant = (t) => {
  authStore.setTenant(t);
  navigateTo('/admin/dashboard');
};

const logout = () => {
  authStore.logout();
  router.push('/admin/login');
};

onMounted(async () => {
  try {
    if (authStore.token && !authStore.user) {
      await authStore.fetchUser();
    }

    if (authStore.isSuperAdmin && !authStore.currentTenant) {
      loadingTenants.value = true;
      tenants.value = await api.get('/tenants');
      loadingTenants.value = false;
    } else {
      const [categories, products, users] = await Promise.all([
        api.get('/categories'),
        api.get('/products'),
        api.get('/users'),
      ]);
      stats.value = {
        categories: categories.length,
        products: products.length,
        users: users.length,
      };
    }
  } catch (error) {
    console.error('Dashboard yüklenemedi:', error);
    loadingTenants.value = false;
  }
});
</script>
