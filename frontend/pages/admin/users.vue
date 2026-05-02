<template>
  <div>
    <!-- Header -->
    <AdminPageHeader title="Kullanıcılar" description="Kullanıcıları ekle, düzenle veya sil.">
      <button @click="openCreateModal()" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Kullanıcı Ekle
      </button>
    </AdminPageHeader>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin h-8 w-8 border-4 border-slate-200 border-t-indigo-500 rounded-full"></div>
    </div>

    <!-- Auth Error -->
    <div v-if="authError" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
      <p class="text-sm text-yellow-800">{{ authError }}</p>
      <div class="flex gap-2 ml-4">
        <button @click="retryAuth" class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium">Tekrar Dene</button>
        <button @click="() => navigateTo('/admin/login')" class="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium">Giriş Yap</button>
      </div>
    </div>

    <!-- Grid -->
    <div v-else-if="users.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="user in users" :key="user.id" class="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition p-5">
        <div class="flex items-start gap-3 mb-3">
          <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="text-indigo-700 font-semibold text-sm">{{ (user.name || user.email || '?').charAt(0).toUpperCase() }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-slate-800 truncate">{{ user.name || '—' }}</h3>
            <p class="text-xs text-slate-400 truncate">{{ user.email }}</p>
          </div>
          <span :class="user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'" class="px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0">
            {{ user.isActive ? 'Aktif' : 'Pasif' }}
          </span>
        </div>
        <div class="mb-4">
          <span class="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">{{ user.role }}</span>
        </div>
        <div class="flex gap-2 pt-3 border-t border-slate-100">
          <button @click="editUser(user)" class="flex-1 px-3 py-1.5 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 transition">Düzenle</button>
          <button @click="deleteUser(user.id)" class="flex-1 px-3 py-1.5 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition">Sil</button>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!authError" class="bg-white rounded-xl border border-slate-100 shadow-sm text-center py-16">
      <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <h3 class="font-semibold text-slate-700 mb-1">Henüz kullanıcı yok</h3>
      <p class="text-sm text-slate-400 mb-5">İlk kullanıcıyı davet et veya oluştur.</p>
      <button @click="openCreateModal()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition">
        Kullanıcı Ekle
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div class="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-semibold text-slate-800">{{ isEditing ? 'Kullanıcı Düzenle' : 'Kullanıcı Ekle' }}</h3>
            <p class="text-xs text-slate-400 mt-0.5">{{ isEditing ? 'Kullanıcı bilgilerini güncelle' : 'Yeni kullanıcı hesabı oluştur' }}</p>
          </div>
          <button @click="closeModal" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveUser" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Ad Soyad *</label>
            <input v-model="formData.name" type="text" required placeholder="Ad Soyad"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">E-posta *</label>
            <input v-model="formData.email" type="email" required placeholder="kullanici@ornek.com"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Rol</label>
              <select v-model="formData.role" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm bg-white">
                <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Şifre</label>
              <input v-model="formData.password" type="password" :placeholder="isEditing ? 'Değiştirmek için yaz' : 'Şifre gir'"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
            </div>
          </div>
          <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-slate-700">Aktif</p>
              <p class="text-xs text-slate-400">Kullanıcının giriş yapmasına izin ver</p>
            </div>
            <button type="button" @click="formData.isActive = !formData.isActive"
              :class="formData.isActive ? 'bg-indigo-500' : 'bg-slate-300'"
              class="relative w-11 h-6 rounded-full transition-colors duration-200">
              <span :class="formData.isActive ? 'translate-x-5' : 'translate-x-1'"
                class="absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"></span>
            </button>
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

const api = useApi();
const auth = useAuthStore();
const authError = ref(null);
const users = ref([]);
const roles = ref(['SUPERADMIN', 'ADMIN', 'USER']);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const editingId = ref(null);
const formData = ref({ name: '', email: '', role: 'USER', password: '', isActive: true });

const retryAuth = async () => {
  authError.value = null;
  try {
    await auth.fetchUser();
    if (!auth.user) { authError.value = 'Oturum doğrulanamadı. Lütfen tekrar giriş yapın.'; }
    else { await loadUsers(); }
  } catch { authError.value = 'Kimlik doğrulama başarısız. Tekrar deneyin.'; }
};

const loadUsers = async () => {
  loading.value = true;
  try { users.value = await api.get('/users'); } catch (e) { console.error(e); } finally { loading.value = false; }
};

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  formData.value = { name: '', email: '', role: 'USER', password: '', isActive: true };
  showModal.value = true;
};

const editUser = (user) => {
  isEditing.value = true;
  editingId.value = user.id;
  formData.value = { name: user.name || '', email: user.email || '', role: user.role || 'USER', password: '', isActive: user.isActive === undefined ? true : !!user.isActive };
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; isEditing.value = false; editingId.value = null; };

const saveUser = async () => {
  saving.value = true;
  try {
    const payload: Record<string, any> = { 
      name: formData.value.name, 
      email: formData.value.email, 
      role: formData.value.role, 
      isActive: !!formData.value.isActive,
      ...(auth.currentTenant && formData.value.role !== 'SUPERADMIN' ? { tenantId: auth.currentTenant.id } : {})
    };
    if (formData.value.password) payload.password = formData.value.password;
    if (isEditing.value) { await api.patch(`/users/${editingId.value}`, payload); }
    else { await api.post('/users', payload); }
    closeModal();
    await loadUsers();
  } catch (error) {
    console.error(error);
    alert('Kullanıcı kaydedilemedi. Tekrar deneyin.');
  } finally {
    saving.value = false;
  }
};

const deleteUser = async (id) => {
  if (confirm('Bu kullanıcıyı silmek istediğinden emin misin?')) {
    try { await api.delete(`/users/${id}`); await loadUsers(); }
    catch { alert('Kullanıcı silinemedi.'); }
  }
};

onMounted(async () => {
  if (!auth.token) return navigateTo('/admin/login');
  if (auth.token && !auth.user) { try { await auth.fetchUser(); } catch {} }
  if (!auth.user) { authError.value = 'Oturum doğrulanamadı. Tekrar deneyin veya giriş yapın.'; return; }
  if (!auth.isAdmin) return navigateTo('/admin/dashboard');
  await loadUsers();
});
</script>
