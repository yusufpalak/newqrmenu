<template>
  <div>
    <!-- Header -->
    <AdminPageHeader title="Para Birimleri" description="Çoklu döviz fiyatlandırması için para birimlerini yönet.">
      <button @click="openCreateModal()" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Para Birimi Ekle
      </button>
    </AdminPageHeader>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin h-8 w-8 border-4 border-slate-200 border-t-indigo-500 rounded-full"></div>
    </div>

    <!-- Grid -->
    <div v-else-if="currencies.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="currency in currencies" :key="currency.id" class="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition p-5">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="text-xl font-bold text-amber-600">{{ currency.symbol }}</span>
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-lg">{{ currency.code }}</h3>
            <span :class="currency.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'" class="px-2 py-0.5 rounded-full text-xs font-medium border">
              {{ currency.isActive ? 'Aktif' : 'Pasif' }}
            </span>
          </div>
        </div>
        <div class="flex gap-2 pt-3 border-t border-slate-100">
          <button @click="editCurrency(currency)" class="flex-1 px-3 py-1.5 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 transition">Düzenle</button>
          <button @click="deleteCurrency(currency.id)" class="flex-1 px-3 py-1.5 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition">Sil</button>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="bg-white rounded-xl border border-slate-100 shadow-sm text-center py-16">
      <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="font-semibold text-slate-700 mb-1">Henüz para birimi yok</h3>
      <p class="text-sm text-slate-400 mb-5">Çoklu döviz fiyatlandırması için para birimi ekle.</p>
      <button @click="openCreateModal()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition">
        Para Birimi Ekle
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div class="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-semibold text-slate-800">{{ isEditing ? 'Para Birimi Düzenle' : 'Para Birimi Ekle' }}</h3>
            <p class="text-xs text-slate-400 mt-0.5">{{ isEditing ? 'Para birimi bilgilerini güncelle' : 'Yeni para birimi oluştur' }}</p>
          </div>
          <button @click="closeModal" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveCurrency" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Para Birimi Kodu *</label>
            <input v-model="formData.code" type="text" required maxlength="3" placeholder="ör. USD, EUR, TRY"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm uppercase" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Sembol *</label>
            <input v-model="formData.symbol" type="text" required maxlength="5" placeholder="ör. $, €, ₺"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
          </div>
          <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-slate-700">Aktif</p>
              <p class="text-xs text-slate-400">Fiyatlandırmada kullan</p>
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

<script setup>
definePageMeta({ layout: 'admin' });

const api = useApi();
const currencies = ref([]);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const editingId = ref(null);
const formData = ref({ code: '', symbol: '', isActive: true });

const loadCurrencies = async () => {
  loading.value = true;
  try { currencies.value = await api.get('/currencies'); } catch (e) { console.error(e); } finally { loading.value = false; }
};

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  formData.value = { code: '', symbol: '', isActive: true };
  showModal.value = true;
};

const editCurrency = (currency) => {
  isEditing.value = true;
  editingId.value = currency.id;
  formData.value = { code: currency.code, symbol: currency.symbol, isActive: currency.isActive };
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; isEditing.value = false; editingId.value = null; };

const saveCurrency = async () => {
  saving.value = true;
  try {
    if (isEditing.value) { await api.patch(`/currencies/${editingId.value}`, formData.value); }
    else { await api.post('/currencies', formData.value); }
    closeModal();
    await loadCurrencies();
  } catch (e) { console.error(e); alert('Para birimi kaydedilemedi. Tekrar deneyin.'); } finally { saving.value = false; }
};

const deleteCurrency = async (id) => {
  if (confirm('Bu para birimini silmek istediğinden emin misin? Mevcut ürün fiyatları etkilenebilir.')) {
    try { await api.delete(`/currencies/${id}`); await loadCurrencies(); }
    catch { alert('Para birimi silinemedi.'); }
  }
};

onMounted(loadCurrencies);
</script>
