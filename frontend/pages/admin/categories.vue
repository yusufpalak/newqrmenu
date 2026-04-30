<template>
  <div>
    <!-- Header -->
    <AdminPageHeader title="Kategoriler" description="Menü kategorilerini ekle, düzenle veya sil.">
      <button @click="openCreateModal()" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Kategori Ekle
      </button>
    </AdminPageHeader>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin h-8 w-8 border-4 border-slate-200 border-t-indigo-500 rounded-full"></div>
    </div>

    <!-- Grid -->
    <div v-else-if="categories.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="category in categories" :key="category.id" class="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-slate-800 truncate">{{ category.name }}</h3>
            <p class="text-xs text-slate-400 mt-0.5">{{ category.slug }}</p>
          </div>
          <span :class="category.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'" class="ml-2 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0">
            {{ category.isActive ? 'Aktif' : 'Pasif' }}
          </span>
        </div>
        <p class="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[2.5rem]">{{ category.description || 'Açıklama yok' }}</p>
        <div class="flex items-center justify-between pt-3 border-t border-slate-100">
          <span class="text-xs text-slate-400">{{ category.products?.length || 0 }} ürün</span>
          <div class="flex gap-2">
            <button @click="editCategory(category)" class="px-3 py-1.5 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 transition">Düzenle</button>
            <button @click="deleteCategory(category.id)" class="px-3 py-1.5 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition">Sil</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="bg-white rounded-xl border border-slate-100 shadow-sm text-center py-16">
      <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </div>
      <h3 class="font-semibold text-slate-700 mb-1">Henüz kategori yok</h3>
      <p class="text-sm text-slate-400 mb-5">İlk menü kategorini oluşturarak başla.</p>
      <button @click="openCreateModal()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition">
        Kategori Ekle
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 class="text-lg font-semibold text-slate-800">{{ isEditing ? 'Kategori Düzenle' : 'Kategori Ekle' }}</h3>
            <p class="text-xs text-slate-400 mt-0.5">{{ isEditing ? 'Kategori bilgilerini güncelle' : 'Yeni menü kategorisi oluştur' }}</p>
          </div>
          <button @click="closeModal" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveCategory" class="flex flex-col flex-1 min-h-0">
          <div class="overflow-y-auto flex-1 p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Kategori Adı * <span class="text-slate-400 font-normal">(Türkçe)</span></label>
              <input v-model="formData.name" type="text" required placeholder="ör. Ana Yemekler, Tatlılar"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Açıklama <span class="text-slate-400 font-normal">(Türkçe)</span></label>
              <textarea v-model="formData.description" rows="2" placeholder="Bu kategorinin kısa açıklaması"
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
const categories = ref([]);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const editingId = ref(null);

const formData = ref({ name: '', description: '', isActive: true, translations: [] });

const loadCategories = async () => {
  loading.value = true;
  try {
    categories.value = await api.get('/categories');
  } catch (error) {
    console.error('Failed to load categories:', error);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  formData.value = { name: '', description: '', isActive: true, translations: [] };
  showModal.value = true;
};

const editCategory = (category) => {
  isEditing.value = true;
  editingId.value = category.id;
  formData.value = {
    name: category.name,
    description: category.description || '',
    isActive: category.isActive,
    translations: category.translations || [],
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  editingId.value = null;
};

const saveCategory = async () => {
  saving.value = true;
  try {
    const translations = (formData.value.translations || [])
      .filter(t => t.locale && t.name?.trim())
      .map(({ locale, name, description }) => ({ locale, name: name.trim(), description: description?.trim() || undefined }));
    const payload = { ...formData.value, translations: translations.length ? translations : undefined };
    if (isEditing.value) {
      await api.patch(`/categories/${editingId.value}`, payload);
    } else {
      await api.post('/categories', payload);
    }
    closeModal();
    await loadCategories();
  } catch (error) {
    console.error('Failed to save category:', error);
    alert('Kategori kaydedilemedi. Tekrar deneyin.');
  } finally {
    saving.value = false;
  }
};

const deleteCategory = async (id) => {
  if (confirm('Bu kategoriyi silmek istediğinden emin misin?')) {
    try {
      await api.delete(`/categories/${id}`);
      await loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Kategori silinemedi.');
    }
  }
};

onMounted(loadCategories);
</script>
