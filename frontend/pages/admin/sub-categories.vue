<template>
  <div>
    <!-- Header -->
    <AdminPageHeader title="Alt Kategoriler" description="Ana kategoriler altında alt kategorileri yönet.">
      <button @click="openCreateModal()" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Alt Kategori Ekle
      </button>
    </AdminPageHeader>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin h-8 w-8 border-4 border-slate-200 border-t-indigo-500 rounded-full"></div>
    </div>

    <!-- Grouped List -->
    <div v-else-if="groupedSubCategories.length > 0" class="space-y-6">
      <div v-for="group in groupedSubCategories" :key="group.categoryId" class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <!-- Category header -->
        <div class="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <h3 class="font-semibold text-slate-700">{{ group.categoryName }}</h3>
          </div>
          <span class="text-xs text-slate-400">{{ group.subCategories.length }} alt kategori</span>
        </div>
        <!-- Sub-categories grid -->
        <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="subCat in group.subCategories" :key="subCat.id" class="flex items-start justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <h4 class="font-medium text-slate-800 text-sm truncate">{{ subCat.name }}</h4>
                <span :class="subCat.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'" class="px-1.5 py-0.5 rounded text-xs font-medium border flex-shrink-0">
                  {{ subCat.isActive ? 'Aktif' : 'Pasif' }}
                </span>
              </div>
              <p class="text-xs text-slate-400 truncate">{{ subCat.slug }}</p>
              <p v-if="subCat.description" class="text-xs text-slate-500 mt-1 line-clamp-1">{{ subCat.description }}</p>
            </div>
            <div class="flex gap-1 ml-2 flex-shrink-0">
              <button @click="editSubCategory(subCat)" class="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition" title="Düzenle">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="deleteSubCategory(subCat.id)" class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition" title="Sil">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="bg-white rounded-xl border border-slate-100 shadow-sm text-center py-16">
      <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 class="font-semibold text-slate-700 mb-1">Henüz alt kategori yok</h3>
      <p class="text-sm text-slate-400 mb-5">Menüyü daha iyi organize etmek için alt kategori oluştur.</p>
      <button @click="openCreateModal()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition">
        Alt Kategori Ekle
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 class="text-lg font-semibold text-slate-800">{{ isEditing ? 'Alt Kategori Düzenle' : 'Alt Kategori Ekle' }}</h3>
            <p class="text-xs text-slate-400 mt-0.5">{{ isEditing ? 'Alt kategori bilgilerini güncelle' : 'Ana kategori altında yeni alt kategori oluştur' }}</p>
          </div>
          <button @click="closeModal" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveSubCategory" class="flex flex-col flex-1 min-h-0">
          <div class="overflow-y-auto flex-1 p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Ana Kategori *</label>
              <select v-model="formData.categoryId" required
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm bg-white">
                <option value="">Kategori seç</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Alt Kategori Adı * <span class="text-slate-400 font-normal">(Türkçe)</span></label>
              <input v-model="formData.name" type="text" required placeholder="ör. Pizza Çeşitleri"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Açıklama <span class="text-slate-400 font-normal">(Türkçe)</span></label>
              <textarea v-model="formData.description" rows="2" placeholder="Bu alt kategorinin kısa açıklaması"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm resize-none"></textarea>
            </div>
            <AdminTranslationFields v-model="formData.translations" />
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-slate-700">Aktif</p>
                <p class="text-xs text-slate-400">Menüde göster</p>
              </div>
              <button type="button" @click="formData.isActive = !formData.isActive"
                :class="formData.isActive ? 'bg-indigo-500' : 'bg-slate-300'"
                class="relative w-11 h-6 rounded-full transition-colors duration-200">
                <span :class="formData.isActive ? 'translate-x-5' : 'translate-x-1'"
                  class="absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"></span>
              </button>
            </div>
          </div>
          <div class="flex gap-3 flex-shrink-0 p-6 border-t border-slate-100">
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
const subCategories = ref([]);
const categories = ref([]);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const editingId = ref(null);
const formData = ref({ name: '', description: '', categoryId: '', isActive: true, translations: [] });

const groupedSubCategories = computed(() => {
  const groups = {};
  subCategories.value.forEach(subCat => {
    const catId = subCat.categoryId;
    if (!groups[catId]) {
      const category = categories.value.find(c => c.id === catId);
      groups[catId] = { categoryId: catId, categoryName: category?.name || 'Bilinmeyen Kategori', subCategories: [] };
    }
    groups[catId].subCategories.push(subCat);
  });
  return Object.values(groups);
});

const loadSubCategories = async () => {
  loading.value = true;
  try { subCategories.value = await api.get('/sub-categories'); } catch (e) { console.error(e); } finally { loading.value = false; }
};

const loadCategories = async () => {
  try { categories.value = await api.get('/categories'); } catch (e) { console.error(e); }
};

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  formData.value = { name: '', description: '', categoryId: '', isActive: true, translations: [] };
  showModal.value = true;
};

const editSubCategory = (subCat) => {
  isEditing.value = true;
  editingId.value = subCat.id;
  formData.value = {
    name: subCat.name,
    description: subCat.description || '',
    categoryId: subCat.categoryId,
    isActive: subCat.isActive,
    translations: subCat.translations || [],
  };
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; isEditing.value = false; editingId.value = null; };

const saveSubCategory = async () => {
  saving.value = true;
  try {
    const translations = (formData.value.translations || [])
      .filter(t => t.locale && t.name?.trim())
      .map(({ locale, name, description }) => ({ locale, name: name.trim(), description: description?.trim() || undefined }));
    const payload = { ...formData.value, translations: translations.length ? translations : undefined };
    if (isEditing.value) { await api.patch(`/sub-categories/${editingId.value}`, payload); }
    else { await api.post('/sub-categories', payload); }
    closeModal();
    await loadSubCategories();
  } catch (e) { console.error(e); alert('Alt kategori kaydedilemedi. Tekrar deneyin.'); } finally { saving.value = false; }
};

const deleteSubCategory = async (id) => {
  if (confirm('Bu alt kategoriyi silmek istediğinden emin misin?')) {
    try { await api.delete(`/sub-categories/${id}`); await loadSubCategories(); }
    catch { alert('Alt kategori silinemedi.'); }
  }
};

onMounted(async () => {
  await Promise.all([loadSubCategories(), loadCategories()]);
});
</script>
