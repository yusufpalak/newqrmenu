<template>
  <div>
    <!-- Header -->
    <AdminPageHeader title="Restoranlar" description="Restoran tenantlarını ekle, düzenle veya sil.">
      <button @click="openCreate()" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tenant Ekle
      </button>
    </AdminPageHeader>

    <!-- Auth Error -->
    <div v-if="authError" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
      <p class="text-sm text-yellow-800">{{ authError }}</p>
      <div class="flex gap-2 ml-4">
        <button @click="retryAuth" class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium">Tekrar Dene</button>
        <button @click="() => navigateTo('/admin/login')" class="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium">Giriş Yap</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin h-8 w-8 border-4 border-slate-200 border-t-indigo-500 rounded-full"></div>
    </div>

    <!-- Grid -->
    <div v-else-if="tenants.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="t in tenants" :key="t.id" class="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition p-5">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-slate-800">{{ t.name }}</h3>
              <p class="text-xs text-slate-400 mt-0.5">{{ t.slug || t.id }}</p>
            </div>
          </div>
          <a :href="`/${t.slug}`" target="_blank" class="text-slate-300 hover:text-indigo-500 transition p-1.5 rounded-lg hover:bg-indigo-50">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        <p v-if="t.createdAt" class="text-xs text-slate-400 mb-4">
          {{ new Date(t.createdAt).toLocaleDateString('tr-TR') }} tarihinde oluşturuldu
        </p>
        <div class="flex gap-2 pt-3 border-t border-slate-100">
          <button @click="selectAndManage(t)" class="flex-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">Yönet</button>
          <button @click="editTenant(t)" class="px-3 py-1.5 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 transition border border-indigo-100">Düzenle</button>
          <button @click="removeTenant(t.id)" class="px-3 py-1.5 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition border border-red-100">Sil</button>
        </div>
      </div>

      <!-- Add new card -->
      <button @click="openCreate()" class="bg-white rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 transition p-5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 min-h-[140px]">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="text-sm font-medium">Yeni Tenant</span>
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="!authError" class="bg-white rounded-xl border border-slate-100 shadow-sm text-center py-16">
      <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 class="font-semibold text-slate-700 mb-1">Henüz tenant yok</h3>
      <p class="text-sm text-slate-400 mb-5">İlk restoranı ekleyerek başla.</p>
      <button @click="openCreate()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition">
        Tenant Ekle
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div class="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-semibold text-slate-800">{{ isEditing ? 'Tenant Düzenle' : 'Tenant Ekle' }}</h3>
            <p class="text-xs text-slate-400 mt-0.5">{{ isEditing ? 'Tenant bilgilerini güncelle' : 'Yeni restoran tenant\'ı oluştur' }}</p>
          </div>
          <button @click="closeModal" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveTenant" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Restoran Adı *</label>
            <input v-model="form.name" required placeholder="ör. Lezzet Durağı"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Slug</label>
            <input v-model="form.slug" placeholder="ör. lezzet-duragi"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
            <p class="text-xs text-slate-400 mt-1">Menü URL'si için kullanılır: /slug</p>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeModal" class="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
              İptal
            </button>
            <button type="submit" :disabled="saving" class="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              <svg v-if="saving" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ isEditing ? 'Güncelle' : 'Kaydet' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' });

const tenants = ref([]);
const loading = ref(false);
const authError = ref(null);
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const saving = ref(false);
const form = ref({ name: '', slug: '' });

const api = useApi();
const auth = useAuthStore();

const load = async () => {
  loading.value = true;
  try { tenants.value = await api.get('/tenants'); } catch { tenants.value = []; } finally { loading.value = false; }
};

const retryAuth = async () => {
  authError.value = null;
  try {
    await auth.fetchUser();
    if (!auth.user) { authError.value = 'Oturum doğrulanamadı. Lütfen tekrar giriş yapın.'; }
    else { await load(); }
  } catch { authError.value = 'Kimlik doğrulama başarısız. Tekrar deneyin.'; }
};

const openCreate = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = { name: '', slug: '' };
  showModal.value = true;
};

const editTenant = (t) => {
  isEditing.value = true;
  editingId.value = t.id;
  form.value = { name: t.name || '', slug: t.slug || '' };
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; saving.value = false; };

const selectAndManage = (t) => {
  auth.setTenant(t);
  navigateTo('/admin/dashboard');
};

const saveTenant = async () => {
  saving.value = true;
  try {
    if (isEditing.value) { await api.patch(`/tenants/${editingId.value}`, form.value); }
    else { await api.post('/tenants', form.value); }
    await load();
    closeModal();
  } catch { alert('Tenant kaydedilemedi.'); } finally { saving.value = false; }
};

const removeTenant = async (id) => {
  if (!confirm('Bu tenantı silmek istediğinden emin misin?')) return;
  try { await api.delete(`/tenants/${id}`); await load(); }
  catch { alert('Tenant silinemedi.'); }
};

onMounted(async () => {
  if (!auth.token) return navigateTo('/admin/login');
  if (auth.token && !auth.user) { try { await auth.fetchUser(); } catch {} }
  if (!auth.user) { authError.value = 'Oturum doğrulanamadı. Tekrar deneyin veya giriş yapın.'; return; }
  if (!auth.isSuperAdmin) return navigateTo('/admin/dashboard');
  await load();
});
</script>
