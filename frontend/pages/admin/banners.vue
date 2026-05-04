<template>
  <div>
    <AdminPageHeader title="Kampanya Bannerları" description="Menü sayfasında gösterilecek kampanya bannerları.">
      <button @click="openCreate" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Banner Ekle
      </button>
    </AdminPageHeader>

    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin h-8 w-8 border-4 border-slate-200 border-t-indigo-500 rounded-full"></div>
    </div>

    <div v-else-if="banners.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="b in banners" :key="b.id"
        class="rounded-xl overflow-hidden border border-slate-100 shadow-sm relative"
        :style="{ backgroundColor: b.bgColor, color: b.textColor }"
      >
        <!-- Status badge -->
        <span class="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium"
          :class="bannerBadgeClass(b)">
          {{ bannerBadgeLabel(b) }}
        </span>

        <div class="p-5">
          <p class="text-xs font-semibold tracking-widest uppercase opacity-70 mb-1">Kampanya</p>
          <h3 class="text-lg font-bold">{{ b.title }}</h3>
          <p v-if="b.subtitle" class="text-sm opacity-80 mt-1">{{ b.subtitle }}</p>
          <div v-if="b.startsAt || b.endsAt" class="text-xs opacity-60 mt-2">
            <span v-if="b.startsAt">{{ new Date(b.startsAt).toLocaleDateString('tr-TR') }}</span>
            <span v-if="b.startsAt && b.endsAt"> – </span>
            <span v-if="b.endsAt">{{ new Date(b.endsAt).toLocaleDateString('tr-TR') }}</span>
          </div>
        </div>

        <div class="flex gap-2 px-5 pb-4">
          <button @click="editBanner(b)"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border transition"
            :style="{ borderColor: b.textColor + '40', color: b.textColor }">
            Düzenle
          </button>
          <button @click="toggleBanner(b)"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border transition"
            :style="{ borderColor: b.textColor + '40', color: b.textColor }">
            {{ b.isActive ? 'Pasifleştir' : 'Aktifleştir' }}
          </button>
          <button @click="deleteBanner(b.id)"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition bg-white/80">
            Sil
          </button>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-xl border border-slate-100 shadow-sm text-center py-16">
      <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      </div>
      <h3 class="font-semibold text-slate-700 mb-1">Henüz banner yok</h3>
      <p class="text-sm text-slate-400 mb-5">İlk kampanya bannerınızı ekleyin.</p>
      <button @click="openCreate" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition">Banner Ekle</button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 class="text-lg font-semibold text-slate-800">{{ editingId ? 'Banner Düzenle' : 'Banner Ekle' }}</h3>
          <button @click="closeModal" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveBanner" class="p-6 space-y-4">
          <!-- Preview -->
          <div class="rounded-xl p-4 flex items-center gap-4 relative overflow-hidden"
            :style="{ backgroundColor: form.bgColor, color: form.textColor }">
            <div>
              <p class="text-xs font-semibold tracking-widest uppercase opacity-60">Kampanya</p>
              <p class="font-bold text-lg">{{ form.title || 'Banner Başlığı' }}</p>
              <p v-if="form.subtitle" class="text-sm opacity-80">{{ form.subtitle }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Başlık *</label>
            <input v-model="form.title" required placeholder="ör. Hafta sonu %20 indirim!"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Alt Başlık</label>
            <input v-model="form.subtitle" placeholder="ör. Tüm ana yemeklerde geçerlidir."
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Arkaplan Rengi</label>
              <div class="flex items-center gap-2">
                <input type="color" v-model="form.bgColor" class="h-9 w-12 rounded cursor-pointer border border-slate-200" />
                <input v-model="form.bgColor" class="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Yazı Rengi</label>
              <div class="flex items-center gap-2">
                <input type="color" v-model="form.textColor" class="h-9 w-12 rounded cursor-pointer border border-slate-200" />
                <input v-model="form.textColor" class="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" />
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Başlangıç Tarihi</label>
              <input type="datetime-local" v-model="form.startsAt"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Bitiş Tarihi</label>
              <input type="datetime-local" v-model="form.endsAt"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
            </div>
          </div>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="form.isActive" class="w-4 h-4 text-indigo-600 rounded" />
            <span class="text-sm text-slate-700">Aktif (menüde göster)</span>
          </label>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeModal" class="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition">İptal</button>
            <button type="submit" :disabled="saving" class="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              <svg v-if="saving" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ editingId ? 'Güncelle' : 'Kaydet' }}
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

const banners = ref<any[]>([]);
const loading = ref(true);
const showModal = ref(false);
const saving = ref(false);
const editingId = ref<string | null>(null);

const defaultForm = () => ({
  title: '',
  subtitle: '',
  bgColor: '#F59E0B',
  textColor: '#1C1917',
  startsAt: '',
  endsAt: '',
  isActive: true,
});

const form = ref(defaultForm());

const recordActive = (b: { isActive?: unknown }) =>
  b.isActive === true || b.isActive === 'true' || b.isActive === 1;

/** Kayıt aktif mi + tarih aralığına göre menüde görünürlük etiketi */
const bannerBadgeLabel = (b: { isActive?: unknown; startsAt?: string | null; endsAt?: string | null }) => {
  if (!recordActive(b)) return 'Pasif';
  const now = new Date();
  if (b.startsAt && new Date(b.startsAt) > now) return 'Aktif · bekliyor';
  if (b.endsAt && new Date(b.endsAt) < now) return 'Aktif · süresi doldu';
  return 'Menüde';
};

const bannerBadgeClass = (b: { isActive?: unknown; startsAt?: string | null; endsAt?: string | null }) => {
  if (!recordActive(b)) return 'bg-slate-100 text-slate-500';
  const now = new Date();
  if (b.startsAt && new Date(b.startsAt) > now) return 'bg-amber-100 text-amber-800';
  if (b.endsAt && new Date(b.endsAt) < now) return 'bg-orange-100 text-orange-800';
  return 'bg-emerald-100 text-emerald-700';
};

const load = async () => {
  loading.value = true;
  try {
    banners.value = await api.get('/banners');
  } catch { banners.value = []; }
  finally { loading.value = false; }
};

const openCreate = () => {
  editingId.value = null;
  form.value = defaultForm();
  showModal.value = true;
};

const editBanner = (b: any) => {
  editingId.value = b.id;
  form.value = {
    title: b.title,
    subtitle: b.subtitle ?? '',
    bgColor: b.bgColor ?? '#F59E0B',
    textColor: b.textColor ?? '#1C1917',
    startsAt: b.startsAt ? new Date(b.startsAt).toISOString().slice(0,16) : '',
    endsAt: b.endsAt ? new Date(b.endsAt).toISOString().slice(0,16) : '',
    isActive: b.isActive,
  };
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; saving.value = false; };

const saveBanner = async () => {
  saving.value = true;
  try {
    const payload: any = { ...form.value };
    if (!payload.startsAt) delete payload.startsAt;
    if (!payload.endsAt) delete payload.endsAt;
    if (editingId.value) {
      await api.patch(`/banners/${editingId.value}`, payload);
    } else {
      await api.post('/banners', payload);
    }
    await load();
    closeModal();
  } catch { alert('Banner kaydedilemedi.'); }
  finally { saving.value = false; }
};

const toggleBanner = async (b: any) => {
  try {
    await api.patch(`/banners/${b.id}`, { isActive: !b.isActive });
    await load();
  } catch { /* ignore */ }
};

const deleteBanner = async (id: string) => {
  if (!confirm('Bu bannerı silmek istediğinden emin misin?')) return;
  try { await api.delete(`/banners/${id}`); await load(); } catch { /* ignore */ }
};

onMounted(async () => {
  if (!auth.token) return navigateTo('/admin/login');
  if (!auth.user) { try { await auth.fetchUser(); } catch {} }
  await load();
});
</script>
