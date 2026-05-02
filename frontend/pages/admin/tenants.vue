<template>
  <div>
    <!-- Header -->
    <AdminPageHeader title="Restoranlar" description="Restoran tenantlarını ekle, düzenle veya abonelik tanımla.">
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
        <div class="flex items-start justify-between mb-3">
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

        <!-- Subscription Badge -->
        <div class="mb-4">
          <div v-if="t.subscriptionExpiresAt" class="flex items-center gap-2">
            <span
              :class="subscriptionStatus(t).color"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="subscriptionStatus(t).dot"></span>
              {{ subscriptionStatus(t).label }}
            </span>
            <span class="text-xs text-slate-400">{{ t.subscriptionPlan ? planLabel(t.subscriptionPlan) : '' }}</span>
          </div>
          <div v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-slate-50 text-slate-500 border-slate-200">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            Abonelik yok
          </div>
          <p v-if="t.subscriptionExpiresAt" class="text-xs text-slate-400 mt-1">
            Bitiş: {{ new Date(t.subscriptionExpiresAt).toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' }) }}
          </p>
        </div>

        <div class="flex gap-2 pt-3 border-t border-slate-100">
          <button @click="selectAndManage(t)" class="flex-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">Yönet</button>
          <button @click="openSubscription(t)" class="px-3 py-1.5 text-amber-600 text-sm font-medium rounded-lg hover:bg-amber-50 transition border border-amber-100" title="Abonelik Tanımla">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
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

    <!-- Tenant Create/Edit Modal -->
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

    <!-- Subscription Modal -->
    <div v-if="showSubModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="closeSubModal">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div class="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-semibold text-slate-800">Abonelik Tanımla</h3>
            <p class="text-xs text-slate-400 mt-0.5">{{ subTarget?.name }} için abonelik süresi belirle</p>
          </div>
          <button @click="closeSubModal" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveSubscription" class="p-6 space-y-5">
          <!-- Plan Buttons -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Abonelik Planı</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="p in plans" :key="p.value" type="button"
                @click="subForm.plan = p.value; computeExpiry()"
                :class="[
                  'px-3 py-3 rounded-xl text-sm font-medium border-2 transition flex flex-col items-center gap-1',
                  subForm.plan === p.value
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-slate-200 text-slate-600 hover:border-amber-200 hover:bg-amber-50/50'
                ]"
              >
                <span class="text-lg">{{ p.icon }}</span>
                <span>{{ p.label }}</span>
                <span class="text-xs text-slate-400">{{ p.desc }}</span>
              </button>
            </div>
          </div>

          <!-- Expiry Date -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Bitiş Tarihi</label>
            <input
              v-model="subForm.expiresAt"
              type="datetime-local"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition outline-none text-sm"
            />
            <p class="text-xs text-slate-400 mt-1">Plan seçince otomatik hesaplanır, dilersen değiştirebilirsin.</p>
          </div>

          <!-- Current info -->
          <div v-if="subTarget?.subscriptionExpiresAt" class="p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
            Mevcut bitiş: <span class="font-medium">{{ new Date(subTarget.subscriptionExpiresAt).toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }) }}</span>
          </div>

          <div v-if="subError" class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{{ subError }}</div>

          <div class="flex gap-3 pt-1">
            <button type="button" @click="closeSubModal" class="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition">İptal</button>
            <button type="submit" :disabled="subSaving || !subForm.plan" class="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
              <svg v-if="subSaving" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Aboneliği Kaydet
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

// Subscription modal state
const showSubModal = ref(false);
const subTarget = ref(null);
const subSaving = ref(false);
const subError = ref('');
const subForm = ref({ plan: '', expiresAt: '' });

const api = useApi();
const auth = useAuthStore();

const plans = [
  { value: 'DAILY',   label: 'Günlük',   icon: '📅', desc: '1 gün' },
  { value: 'WEEKLY',  label: 'Haftalık',  icon: '📆', desc: '7 gün' },
  { value: 'MONTHLY', label: 'Aylık',     icon: '🗓️', desc: '30 gün' },
  { value: 'YEARLY',  label: 'Yıllık',    icon: '📊', desc: '365 gün' },
];

const planDays: Record<string, number> = { DAILY: 1, WEEKLY: 7, MONTHLY: 30, YEARLY: 365 };

const planLabel = (plan: string) => plans.find(p => p.value === plan)?.label ?? plan;

const subscriptionStatus = (t: any) => {
  if (!t.subscriptionExpiresAt) return { label: 'Abonelik Yok', color: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-300' };
  const exp = new Date(t.subscriptionExpiresAt);
  const now = new Date();
  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Süresi Doldu', color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' };
  if (diffDays <= 3) return { label: `${diffDays} gün kaldı`, color: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-400' };
  return { label: `${diffDays} gün kaldı`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
};

const computeExpiry = () => {
  if (!subForm.value.plan) return;
  const d = new Date();
  d.setDate(d.getDate() + planDays[subForm.value.plan]);
  // Format for datetime-local input
  const pad = (n: number) => String(n).padStart(2, '0');
  subForm.value.expiresAt = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

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

// Subscription
const openSubscription = (t) => {
  subTarget.value = t;
  subForm.value = { plan: t.subscriptionPlan || '', expiresAt: '' };
  subError.value = '';
  showSubModal.value = true;
};

const closeSubModal = () => { showSubModal.value = false; subSaving.value = false; subError.value = ''; };

const saveSubscription = async () => {
  if (!subForm.value.plan) return;
  subSaving.value = true;
  subError.value = '';
  try {
    const payload: any = { plan: subForm.value.plan };
    if (subForm.value.expiresAt) payload.expiresAt = new Date(subForm.value.expiresAt).toISOString();
    await api.patch(`/tenants/${subTarget.value.id}/subscription`, payload);
    await load();
    closeSubModal();
  } catch (e: any) {
    subError.value = e?.data?.message || 'Abonelik kaydedilemedi.';
  } finally { subSaving.value = false; }
};

onMounted(async () => {
  if (!auth.token) return navigateTo('/admin/login');
  if (auth.token && !auth.user) { try { await auth.fetchUser(); } catch {} }
  if (!auth.user) { authError.value = 'Oturum doğrulanamadı. Tekrar deneyin veya giriş yapın.'; return; }
  if (!auth.isSuperAdmin) return navigateTo('/admin/dashboard');
  await load();
});
</script>
