<template>
  <div>
    <!-- Header -->
    <AdminPageHeader title="Ürünler" description="Menü ürünlerini ekle, düzenle veya sil.">
      <button @click="openCreateModal()" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Ürün Ekle
      </button>
    </AdminPageHeader>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin h-8 w-8 border-4 border-slate-200 border-t-indigo-500 rounded-full"></div>
    </div>

    <!-- Grid -->
    <div v-else-if="products.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="product in products" :key="product.id" class="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden group">
        <!-- Product Image -->
        <div class="relative h-40 bg-slate-100 overflow-hidden cursor-pointer" @click="viewImage(product.image)">
          <img v-if="product.image" :src="imageUrl(product.image)" :alt="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <!-- Hover overlay -->
          <div v-if="product.image" class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <svg class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 13H7" />
            </svg>
          </div>
          <span :class="product.isActive ? 'bg-emerald-500' : 'bg-slate-400'" class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium text-white">
            {{ product.isActive ? 'Aktif' : 'Pasif' }}
          </span>
        </div>

        <div class="p-4">
          <h3 class="font-semibold text-slate-800 truncate mb-0.5">{{ product.name }}</h3>
          <p class="text-xs text-slate-400 mb-1">{{ product.category?.name || 'Kategorisiz' }}</p>
          <p v-if="product.subCategory" class="text-xs text-slate-400 mb-2">↳ {{ product.subCategory.name }}</p>
          <div class="flex flex-wrap gap-1 mb-3">
            <span v-for="price in getAllPrices(product)" :key="price.code" class="text-sm font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              {{ price.symbol }}{{ price.price.toFixed(2) }}
            </span>
            <span v-if="getAllPrices(product).length === 0" class="text-xs text-slate-400">Fiyat yok</span>
          </div>
          <div class="flex gap-2 pt-3 border-t border-slate-100">
            <button @click="editProduct(product)" class="flex-1 px-3 py-1.5 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 transition">Düzenle</button>
            <button @click="deleteProduct(product.id)" class="flex-1 px-3 py-1.5 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition">Sil</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="bg-white rounded-xl border border-slate-100 shadow-sm text-center py-16">
      <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <h3 class="font-semibold text-slate-700 mb-1">Henüz ürün yok</h3>
      <p class="text-sm text-slate-400 mb-5">Menüne ilk ürünü ekleyerek başla.</p>
      <button @click="openCreateModal()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition">
        Ürün Ekle
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 class="text-lg font-semibold text-slate-800">{{ isEditing ? 'Ürün Düzenle' : 'Ürün Ekle' }}</h3>
            <p class="text-xs text-slate-400 mt-0.5">{{ isEditing ? 'Ürün bilgilerini güncelle' : 'Yeni menü ürünü oluştur' }}</p>
          </div>
          <button @click="closeModal" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveProduct" class="flex flex-col flex-1 min-h-0">
        <div class="overflow-y-auto flex-1 p-6 space-y-4">

          <!-- Image Upload -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Ürün Görseli</label>
            <div class="flex items-start gap-4">
              <!-- Preview -->
              <div class="w-28 h-28 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 relative group cursor-pointer" @click="formData.image ? viewImage(formData.image) : $refs.fileInput.click()">
                <img v-if="formData.image" :src="imageUrl(formData.image)" class="w-full h-full object-cover" alt="Önizleme" />
                <svg v-else class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <!-- Preview hover overlay -->
                <div v-if="formData.image" class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <!-- Controls -->
              <div class="flex-1">
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
                <!-- Drag and drop area -->
                <div 
                  @dragover.prevent="dragOver = true"
                  @dragleave.prevent="dragOver = false"
                  @drop.prevent="handleFileDrop"
                  :class="dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'"
                  class="border-2 border-dashed rounded-lg p-4 text-center transition-colors"
                >
                  <svg class="w-6 h-6 text-slate-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <p class="text-xs text-slate-600 mb-1">
                    Görseli buraya sürükle ya da
                  </p>
                  <button type="button" @click="$refs.fileInput.click()" :disabled="uploading"
                    class="text-indigo-600 text-xs font-medium hover:text-indigo-700 transition disabled:opacity-50">
                    seç
                  </button>
                </div>
                <p class="text-xs text-slate-400 mt-2">JPG, PNG, WEBP · Maks. 5 MB</p>
                <button v-if="formData.image" type="button" @click="formData.image = ''" class="mt-1 text-xs text-red-400 hover:text-red-600 transition">
                  Görseli kaldır
                </button>
                <!-- Upload status -->
                <div v-if="uploading" class="mt-3 flex items-center gap-2 text-xs text-indigo-600">
                  <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Görsel yükleniyor...
                </div>
                <!-- Image tips -->
                <div class="mt-4 p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <p class="text-xs font-medium text-blue-900 mb-1">💡 Resim İpuçları:</p>
                  <ul class="text-xs text-blue-800 space-y-0.5">
                    <li>• En iyi boyut: 500x500px - 1000x1000px</li>
                    <li>• Format: JPG (kalite için) veya PNG (transparan arka plan)</li>
                    <li>• Dosya boyutu: 100KB - 500KB ideal</li>
                    <li>• Kare format görseller daha iyi görünür</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Ürün Adı * <span class="text-slate-400 font-normal">(Türkçe)</span></label>
            <input v-model="formData.name" type="text" required placeholder="ör. Margherita Pizza"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Açıklama <span class="text-slate-400 font-normal">(Türkçe)</span></label>
            <textarea v-model="formData.description" rows="2" placeholder="Ürün açıklaması"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm resize-none"></textarea>
          </div>

          <AdminTranslationFields v-model="formData.translations" :withIngredients="true" />

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Kategori *</label>
              <select v-model="formData.categoryId" @change="onCategoryChange" required
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm bg-white">
                <option value="">Kategori seç</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Alt Kategori</label>
              <select v-model="formData.subCategoryId"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm bg-white">
                <option value="">Alt kategori yok</option>
                <option v-for="subCat in filteredSubCategories" :key="subCat.id" :value="subCat.id">{{ subCat.name }}</option>
              </select>
            </div>
          </div>

          <!-- Prices -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Fiyatlar</label>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="currency in currencies" :key="currency.id">
                <label class="block text-xs font-medium text-slate-500 mb-1">{{ currency.code }} ({{ currency.symbol }})</label>
                <input v-model.number="formData.prices[currency.id]" type="number" step="0.01" min="0" :placeholder="`0.00 ${currency.code}`"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm" />
              </div>
            </div>
          </div>

          <!-- Active -->
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

          <!-- Nutrition -->
          <div class="border border-slate-200 rounded-xl p-4">
            <h4 class="text-sm font-semibold text-slate-700 mb-3">Besin Değerleri</h4>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">Kalori (kcal)</label>
                <input v-model.number="formData.nutrition.calories" type="number" placeholder="0"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">Protein (g)</label>
                <input v-model.number="formData.nutrition.protein" type="number" step="0.1" placeholder="0"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">Karbonhidrat (g)</label>
                <input v-model.number="formData.nutrition.carbohydrate" type="number" step="0.1" placeholder="0"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">Yağ (g)</label>
                <input v-model.number="formData.nutrition.fat" type="number" step="0.1" placeholder="0"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">Şeker (g)</label>
                <input v-model.number="formData.nutrition.sugar" type="number" step="0.1" placeholder="0"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">Tuz (g)</label>
                <input v-model.number="formData.nutrition.salt" type="number" step="0.1" placeholder="0"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400" />
              </div>
            </div>
            <div class="mt-3">
              <label class="block text-xs font-medium text-slate-500 mb-1">Alerjenler</label>
              <input v-model="formData.nutrition.allergens" type="text" placeholder="ör. Gluten, Süt, Fındık"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400" />
            </div>
            <div class="mt-3">
              <label class="block text-xs font-medium text-slate-500 mb-1">İçindekiler</label>
              <textarea v-model="formData.nutrition.ingredients" rows="2" placeholder="Malzeme listesi"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 resize-none"></textarea>
            </div>
          </div>

        </div>
        <div class="flex gap-3 flex-shrink-0 p-6 border-t border-slate-100">
          <button type="button" @click="closeModal" class="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
            İptal
          </button>
          <button type="submit" :disabled="saving || uploading" class="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
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

    <!-- Image Preview Modal -->
    <div v-if="showImageModal" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" @click.self="showImageModal = false">
      <div class="max-w-4xl w-full relative">
        <button @click="showImageModal = false" class="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img :src="previewImageUrl" :alt="'Ürün Görseli'" class="w-full rounded-lg shadow-2xl" />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();
const api = useApi();
const products = ref([]);
const categories = ref([]);
const subCategories = ref([]);
const currencies = ref([]);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const uploading = ref(false);
const editingId = ref(null);
const fileInput = ref(null);
const dragOver = ref(false);
const showImageModal = ref(false);
const previewImageUrl = ref('');

const formData = ref({
  name: '', description: '', categoryId: '', subCategoryId: '', prices: {}, isActive: true, image: '',
  translations: [],
  nutrition: { calories: null, protein: null, carbohydrate: null, fat: null, sugar: null, salt: null, allergens: '', ingredients: '' }
});

const filteredSubCategories = computed(() => {
  if (!formData.value.categoryId) return [];
  return subCategories.value.filter(sc => sc.categoryId === formData.value.categoryId);
});

const imageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${config.public.apiBase}${path}`;
};

const getAllPrices = (product) => {
  if (!product.prices?.length) return [];
  return product.prices.map(p => ({ code: p.currency?.code || '?', symbol: p.currency?.symbol || '', price: Number(p.price || 0) }));
};

const handleFileSelect = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const formPayload = new FormData();
  formPayload.append('file', file);

  uploading.value = true;
  try {
    const result = await api.upload('/uploads', formPayload);
    formData.value.image = result.url;
  } catch (e) {
    console.error('Upload failed:', e);
    alert('Görsel yüklenemedi. Dosya boyutu 5MB\'ı geçmemeli ve geçerli bir resim formatı olmalı.');
  } finally {
    uploading.value = false;
    dragOver.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const handleFileDrop = async (event) => {
  dragOver.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Lütfen geçerli bir resim dosyası seçin.');
    return;
  }

  // Validate file size
  if (file.size > 5 * 1024 * 1024) {
    alert('Dosya boyutu 5MB\'ı geçmemelidir.');
    return;
  }

  const formPayload = new FormData();
  formPayload.append('file', file);

  uploading.value = true;
  try {
    const result = await api.upload('/uploads', formPayload);
    formData.value.image = result.url;
  } catch (e) {
    console.error('Upload failed:', e);
    alert('Görsel yüklenemedi. Tekrar deneyin.');
  } finally {
    uploading.value = false;
  }
};

const viewImage = (imagePath) => {
  if (!imagePath) return;
  previewImageUrl.value = imageUrl(imagePath);
  showImageModal.value = true;
};

const loadProducts = async () => {
  loading.value = true;
  try { products.value = await api.get('/products'); } catch (e) { console.error(e); } finally { loading.value = false; }
};

const loadCategories = async () => {
  try { categories.value = await api.get('/categories'); } catch (e) { console.error(e); }
};

const loadSubCategories = async () => {
  try { subCategories.value = await api.get('/sub-categories'); } catch (e) { console.error(e); }
};

const loadCurrencies = async () => {
  try { currencies.value = await api.get('/currencies'); } catch (e) { console.error(e); }
};

const onCategoryChange = () => { formData.value.subCategoryId = ''; };

const emptyForm = () => ({
  name: '', description: '', categoryId: '', subCategoryId: '', prices: {}, isActive: true, image: '',
  translations: [],
  nutrition: { calories: null, protein: null, carbohydrate: null, fat: null, sugar: null, salt: null, allergens: '', ingredients: '' }
});

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  formData.value = emptyForm();
  showModal.value = true;
};

const editProduct = (product) => {
  isEditing.value = true;
  editingId.value = product.id;
  const prices = {};
  product.prices?.forEach(p => { prices[p.currencyId] = Number(p.price || 0); });
  formData.value = {
    name: product.name, description: product.description || '',
    categoryId: product.categoryId || product.category?.id || '',
    subCategoryId: product.subCategoryId || product.subCategory?.id || '',
    prices, isActive: product.isActive, image: product.image || '',
    translations: product.translations || [],
    nutrition: {
      calories: product.nutrition?.calories || null, protein: product.nutrition?.protein || null,
      carbohydrate: product.nutrition?.carbohydrate || null, fat: product.nutrition?.fat || null,
      sugar: product.nutrition?.sugar || null, salt: product.nutrition?.salt || null,
      allergens: product.nutrition?.allergens || '', ingredients: product.nutrition?.ingredients || ''
    }
  };
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; isEditing.value = false; editingId.value = null; };

const saveProduct = async () => {
  saving.value = true;
  try {
    const pricesArray = Object.entries(formData.value.prices)
      .filter(([_, price]) => price && price > 0)
      .map(([currencyId, price]) => ({ currencyId, price: parseFloat(price) }));
    const nutritionData = Object.fromEntries(
      Object.entries(formData.value.nutrition).filter(([_, v]) => v !== null && v !== '' && v !== 0)
    );
    const productData = {
      name: formData.value.name, description: formData.value.description,
      categoryId: formData.value.categoryId, subCategoryId: formData.value.subCategoryId || null,
      isActive: formData.value.isActive, prices: pricesArray,
      image: formData.value.image || null,
      translations: (() => {
        const t = (formData.value.translations || [])
          .filter(t => t.locale && t.name?.trim())
          .map(({ locale, name, description, ingredients }) => ({
            locale,
            name: name.trim(),
            description: description?.trim() || undefined,
            ingredients: ingredients?.trim() || undefined,
          }));
        return t.length ? t : undefined;
      })(),
      nutrition: Object.keys(nutritionData).length > 0 ? nutritionData : undefined
    };
    if (isEditing.value) { await api.patch(`/products/${editingId.value}`, productData); }
    else { await api.post('/products', productData); }
    closeModal();
    await loadProducts();
  } catch (error) {
    console.error(error);
    alert('Ürün kaydedilemedi. Tekrar deneyin.');
  } finally {
    saving.value = false;
  }
};

const deleteProduct = async (id) => {
  if (confirm('Bu ürünü silmek istediğinden emin misin?')) {
    try { await api.delete(`/products/${id}`); await loadProducts(); }
    catch { alert('Ürün silinemedi.'); }
  }
};

onMounted(async () => {
  await Promise.all([loadProducts(), loadCategories(), loadSubCategories(), loadCurrencies()]);
});
</script>
