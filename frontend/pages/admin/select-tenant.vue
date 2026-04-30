<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div class="w-full max-w-3xl">

      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-slate-800">Restoran Seç</h2>
        <p class="text-slate-500 mt-2">Yönetmek istediğin restoranı seç ya da tüm sistemi genel olarak yönet.</p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-500"></div>
      </div>

      <div v-else>
        <div v-if="authError" class="p-4 bg-yellow-50 border-l-4 border-yellow-300 rounded-lg mb-6">
          <p class="text-sm text-yellow-800">{{ authError }}</p>
          <div class="mt-3 flex gap-2">
            <button @click="retryAuth" class="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Tekrar Dene</button>
            <button @click="() => navigateTo('/admin/login')" class="px-3 py-1 border rounded text-sm">Giriş Yap</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            v-for="t in tenants"
            :key="t.id"
            @click="selectTenant(t)"
            class="p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all text-left group"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-lg text-slate-800 group-hover:text-indigo-700">{{ t.name }}</h3>
                <p class="text-sm text-slate-400 mt-0.5">{{ t.slug || t.id }}</p>
              </div>
              <svg class="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p v-if="t.createdAt" class="text-xs text-slate-400 mt-3">
              {{ new Date(t.createdAt).toLocaleDateString('tr-TR') }} tarihinde oluşturuldu
            </p>
          </button>
        </div>

        <div v-if="tenants.length === 0 && !authError" class="text-center py-8 text-slate-500">
          Henüz restoran bulunamadı.
        </div>

        <!-- Skip option for superadmin -->
        <div class="border-t border-slate-200 pt-6">
          <button
            @click="skipTenantSelection"
            class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Tenant seçmeden global panele geç
          </button>
          <p class="text-center text-xs text-slate-400 mt-2">Kullanıcılar, tenantlar ve genel ayarları yönetebilirsin</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false });

const tenants = ref([]);
const loading = ref(false);
const auth = useAuthStore();
const api = useApi();
const authError = ref(null);

const retryAuth = async () => {
  authError.value = null;
  try {
    await auth.fetchUser();
    if (!auth.user) {
      authError.value = 'Oturum doğrulanamadı. Lütfen tekrar giriş yapın.';
    } else {
      await loadTenants();
    }
  } catch {
    authError.value = 'Kimlik doğrulama başarısız. Tekrar deneyin.';
  }
};

const loadTenants = async () => {
  loading.value = true;
  try {
    tenants.value = await api.get('/tenants');
  } catch {
    tenants.value = [];
  } finally {
    loading.value = false;
  }
};

const selectTenant = (t) => {
  auth.setTenant(t);
  navigateTo('/admin/dashboard');
};

const skipTenantSelection = () => {
  auth.clearTenant();
  navigateTo('/admin/dashboard');
};

onMounted(async () => {
  if (!auth.token) return navigateTo('/admin/login');
  if (auth.token && !auth.user) {
    try { await auth.fetchUser(); } catch {}
  }
  if (!auth.user) {
    authError.value = 'Oturum doğrulanamadı. Tekrar deneyin veya giriş yapın.';
    return;
  }
  if (!auth.isSuperAdmin) return navigateTo('/admin/dashboard');
  await loadTenants();
});
</script>
