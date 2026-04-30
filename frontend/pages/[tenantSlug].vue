<template>
  <div class="min-h-screen" style="background-color: #F7F5F0;">

    <!-- Hero Header -->
    <header class="relative bg-stone-900 text-white overflow-hidden">
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900"></div>
        <div class="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
      </div>

      <div class="relative z-10 max-w-5xl mx-auto px-5 pt-10 pb-8">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <p class="text-amber-400/90 text-xs font-semibold tracking-[0.15em] uppercase">{{ t('digitalMenu') }}</p>
            </div>
            <h1 class="text-4xl md:text-5xl font-bold tracking-tight leading-none">
              {{ menuData?.tenant?.name || 'Restoran' }}
            </h1>
            <p v-if="menuData?.tenant?.description" class="text-stone-400 mt-3 text-base max-w-lg leading-relaxed">
              {{ menuData.tenant.description }}
            </p>
          </div>

          <!-- Language & Currency -->
          <div v-if="menuData" class="flex gap-2 flex-shrink-0">
            <select
              v-if="menuData.availableLocales?.length > 1"
              v-model="selectedLocale"
              @change="fetchMenu"
              class="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/15 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 appearance-none cursor-pointer"
            >
              <option v-for="loc in menuData.availableLocales" :key="loc" :value="loc" class="text-stone-900 bg-white">
                {{ loc.toUpperCase() }}
              </option>
            </select>
            <select
              v-if="menuData.availableCurrencies?.length > 1"
              v-model="selectedCurrency"
              @change="fetchMenu"
              class="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/15 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 appearance-none cursor-pointer"
            >
              <option v-for="curr in menuData.availableCurrencies" :key="curr.id" :value="curr.code" class="text-stone-900 bg-white">
                {{ curr.code }} ({{ curr.symbol }})
              </option>
            </select>
          </div>
        </div>

        <!-- Category Pills -->
        <div class="mt-8 -mx-5 px-5 overflow-x-auto scrollbar-hide">
          <div class="flex gap-2 pb-1" style="width: max-content;">
            <button
              v-for="cat in menuData?.categories"
              :key="cat.id"
              @click="scrollToCategory(cat.id)"
              :class="[
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                activeCategory === cat.id
                  ? 'bg-amber-400 text-stone-900 shadow-lg shadow-amber-400/25'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white'
              ]"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-10 h-10 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
      <p class="text-stone-400 text-sm">{{ t('loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-5xl mx-auto px-5 py-16 text-center">
      <p class="text-stone-500 text-lg">{{ t('notFound') }}</p>
    </div>

    <!-- Menu Content -->
    <main v-else-if="menuData" class="max-w-5xl mx-auto px-5 py-10">
      <template v-for="cat in menuData.categories" :key="cat.id">
        <section :id="`cat-${cat.id}`" class="mb-14 scroll-mt-6">

          <!-- Category Header -->
          <div class="flex items-center gap-4 mb-7">
            <h2 class="text-xl font-bold text-stone-900">{{ cat.name }}</h2>
            <div class="flex-1 h-px bg-stone-200"></div>
          </div>

          <!-- Subcategories -->
          <template v-for="sub in cat.subCategories" :key="sub.id">
            <div class="mb-8">
              <p class="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">{{ sub.name }}</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ProductCard
                  v-for="p in sub.products"
                  :key="p.id"
                  :product="p"
                  :formatImageUrl="formatImageUrl"
                  :featuredLabel="t('featured')"
                  @click="openProduct(p)"
                />
              </div>
            </div>
          </template>

          <!-- Products without subcategory -->
          <div v-if="cat.products?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ProductCard
              v-for="p in cat.products"
              :key="p.id"
              :product="p"
              :formatImageUrl="formatImageUrl"
              :featuredLabel="t('featured')"
              @click="openProduct(p)"
            />
          </div>
        </section>
      </template>
    </main>

    <!-- Product Detail Drawer (bottom sheet on mobile) -->
    <Transition name="drawer">
      <div
        v-if="selectedProduct"
        class="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        @click.self="selectedProduct = null"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="selectedProduct = null"></div>
        <div class="relative bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

          <!-- Product Image -->
          <div v-if="selectedProduct.image" class="relative h-56 md:h-64 overflow-hidden md:rounded-t-2xl rounded-t-2xl">
            <img :src="formatImageUrl(selectedProduct.image)" :alt="selectedProduct.name" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>

          <!-- Close Button -->
          <button
            @click="selectedProduct = null"
            class="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md text-stone-600 hover:text-stone-900 transition z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="p-6">
            <!-- Name & Badge -->
            <div class="flex items-start justify-between gap-3 mb-2">
              <h2 class="text-xl font-bold text-stone-900 leading-tight">{{ selectedProduct.name }}</h2>
              <span v-if="selectedProduct.isFeatured" class="flex-shrink-0 text-amber-600 text-xs font-semibold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                {{ t('featured') }}
              </span>
            </div>

            <!-- Description -->
            <p v-if="selectedProduct.description" class="text-stone-500 text-sm leading-relaxed mb-5">
              {{ selectedProduct.description }}
            </p>

            <!-- Price -->
            <div class="flex items-baseline gap-2 mb-6">
              <span v-if="selectedProduct.price?.discountedPrice" class="text-stone-400 line-through text-sm">
                {{ formatPrice(selectedProduct.price.amount, selectedProduct.price.currency?.symbol) }}
              </span>
              <span class="text-2xl font-bold text-stone-900">
                {{ formatPrice(selectedProduct.price?.discountedPrice || selectedProduct.price?.amount, selectedProduct.price?.currency?.symbol) }}
              </span>
            </div>

            <!-- Nutrition -->
            <div v-if="selectedProduct.nutrition" class="border-t border-stone-100 pt-5">
              <p class="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">{{ t('nutrition') }}</p>
              <div class="grid grid-cols-3 gap-3">
                <div v-if="selectedProduct.nutrition.calories" class="bg-orange-50 rounded-xl p-3 text-center">
                  <p class="text-lg font-bold text-orange-600">{{ selectedProduct.nutrition.calories }}</p>
                  <p class="text-xs text-orange-500 mt-0.5">kcal</p>
                </div>
                <div v-if="selectedProduct.nutrition.protein" class="bg-blue-50 rounded-xl p-3 text-center">
                  <p class="text-lg font-bold text-blue-600">{{ selectedProduct.nutrition.protein }}g</p>
                  <p class="text-xs text-blue-500 mt-0.5">{{ t('protein') }}</p>
                </div>
                <div v-if="selectedProduct.nutrition.carbohydrate" class="bg-yellow-50 rounded-xl p-3 text-center">
                  <p class="text-lg font-bold text-yellow-600">{{ selectedProduct.nutrition.carbohydrate }}g</p>
                  <p class="text-xs text-yellow-500 mt-0.5">{{ t('carbs') }}</p>
                </div>
                <div v-if="selectedProduct.nutrition.fat" class="bg-red-50 rounded-xl p-3 text-center">
                  <p class="text-lg font-bold text-red-600">{{ selectedProduct.nutrition.fat }}g</p>
                  <p class="text-xs text-red-500 mt-0.5">{{ t('fat') }}</p>
                </div>
                <div v-if="selectedProduct.nutrition.sugar" class="bg-pink-50 rounded-xl p-3 text-center">
                  <p class="text-lg font-bold text-pink-600">{{ selectedProduct.nutrition.sugar }}g</p>
                  <p class="text-xs text-pink-500 mt-0.5">{{ t('sugar') }}</p>
                </div>
                <div v-if="selectedProduct.nutrition.salt" class="bg-stone-50 rounded-xl p-3 text-center">
                  <p class="text-lg font-bold text-stone-600">{{ selectedProduct.nutrition.salt }}g</p>
                  <p class="text-xs text-stone-500 mt-0.5">{{ t('salt') }}</p>
                </div>
              </div>
              <div v-if="selectedProduct.nutrition.allergens" class="mt-3 p-3 bg-red-50 rounded-xl">
                <p class="text-xs font-semibold text-red-600 mb-1">{{ t('allergens') }}</p>
                <p class="text-xs text-red-500">{{ selectedProduct.nutrition.allergens }}</p>
              </div>
              <div v-if="selectedProduct.nutrition.ingredients" class="mt-3 p-3 bg-stone-50 rounded-xl">
                <p class="text-xs font-semibold text-stone-500 mb-1">{{ t('ingredients') }}</p>
                <p class="text-xs text-stone-400 leading-relaxed">{{ selectedProduct.nutrition.ingredients }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<!-- Product Card Component -->
<script>
const ProductCard = defineComponent({
  props: { product: Object, formatImageUrl: Function, featuredLabel: String },
  emits: ['click'],
  setup(props, { emit }) {
    const formatPrice = (amount, symbol) => {
      if (!amount) return '';
      return `${symbol || ''} ${parseFloat(amount).toFixed(2)}`;
    };
    return () => {
      const p = props.product;
      return h('button', {
        class: 'group w-full text-left flex gap-4 p-4 bg-white rounded-xl border border-stone-100 hover:border-stone-200 hover:shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer',
        onClick: () => emit('click', p),
      }, [
        h('div', { class: 'flex-1 min-w-0 flex flex-col' }, [
          h('div', { class: 'flex items-start justify-between gap-2' }, [
            h('h4', { class: 'font-semibold text-stone-900 text-sm leading-snug' }, p.name),
            p.isFeatured ? h('span', { class: 'flex-shrink-0 text-amber-500 text-[10px] font-semibold bg-amber-50 px-2 py-0.5 rounded-full' }, `★ ${props.featuredLabel}`) : null,
          ]),
          p.description ? h('p', { class: 'text-stone-400 text-xs mt-1 line-clamp-2 leading-relaxed' }, p.description) : null,
          h('div', { class: 'mt-auto pt-3 flex items-baseline gap-1.5' }, [
            p.price?.discountedPrice ? h('span', { class: 'text-stone-300 line-through text-xs' }, formatPrice(p.price.amount, p.price.currency?.symbol)) : null,
            h('span', { class: 'text-stone-900 font-bold text-sm' }, formatPrice(p.price?.discountedPrice || p.price?.amount, p.price?.currency?.symbol)),
          ]),
        ]),
        p.image
          ? h('div', { class: 'flex-shrink-0' }, [
              h('img', {
                src: props.formatImageUrl(p.image),
                alt: p.name,
                class: 'w-20 h-20 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300',
              }),
            ])
          : h('div', { class: 'flex-shrink-0 w-20 h-20 bg-stone-50 rounded-xl flex items-center justify-center' }, [
              h('svg', { class: 'w-6 h-6 text-stone-200', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
                h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.5', d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' }),
              ]),
            ]),
      ]);
    };
  },
});
</script>

<script setup>
definePageMeta({ layout: false });

const route = useRoute();
const config = useRuntimeConfig();

const menuData = ref(null);
const selectedLocale = ref('tr');
const selectedCurrency = ref('TRY');
const activeCategory = ref(null);
const selectedProduct = ref(null);
const loading = ref(false);
const error = ref(false);

const uiTranslations = {
  tr: {
    digitalMenu: 'Dijital Menü',
    loading: 'Menü yükleniyor...',
    notFound: 'Menü bulunamadı.',
    featured: 'Öne Çıkan',
    nutrition: 'Besin Değerleri',
    protein: 'Protein',
    carbs: 'Karbonhidrat',
    fat: 'Yağ',
    sugar: 'Şeker',
    salt: 'Tuz',
    allergens: 'Alerjenler',
    ingredients: 'İçindekiler',
    coldbeverages: 'Soğuk İçecekler',
    hotbeverages: 'Sıcak İçecekler',
    beverages: 'İçecekler',
    meals:'Yemekler',
  },
  en: {
    digitalMenu: 'Digital Menu',
    loading: 'Loading menu...',
    notFound: 'Menu not found.',
    featured: 'Featured',
    nutrition: 'Nutrition',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    sugar: 'Sugar',
    salt: 'Salt',
    allergens: 'Allergens',
    ingredients: 'Ingredients',
    coldbeverages: 'Cold Beverages',
    beverages: 'Beverages',
    meals:'Meals',
  },
  de: {
    digitalMenu: 'Digitale Speisekarte',
    loading: 'Menü wird geladen...',
    notFound: 'Menü nicht gefunden.',
    featured: 'Empfohlen',
    nutrition: 'Nährwerte',
    protein: 'Protein',
    carbs: 'Kohlenhydrate',
    fat: 'Fett',
    sugar: 'Zucker',
    salt: 'Salz',
    allergens: 'Allergene',
    ingredients: 'Zutaten',
    coldbeverages: 'Kalte Getränke',
    beverages: 'Getränke',
    meals:'Gerichte',
  },
  ar: {
    digitalMenu: 'القائمة الرقمية',
    loading: 'جارٍ تحميل القائمة...',
    notFound: 'القائمة غير موجودة.',
    featured: 'مميز',
    nutrition: 'القيم الغذائية',
    protein: 'بروتين',
    carbs: 'كربوهيدرات',
    fat: 'دهون',
    sugar: 'سكر',
    salt: 'ملح',
    allergens: 'مسببات الحساسية',
    ingredients: 'المكونات',
    coldbeverages: 'المشروبات الباردة',
    beverages: 'المشروبات',
    meals:'الوجبات',
  },
};

const t = (key) => uiTranslations[selectedLocale.value]?.[key] ?? uiTranslations.tr[key] ?? key;

const formatPrice = (amount, symbol) => {
  if (!amount) return '';
  return `${symbol || ''} ${parseFloat(amount).toFixed(2)}`;
};

const formatImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${config.public.apiBase}${path}`;
};

const openProduct = (p) => { selectedProduct.value = p; };

const scrollToCategory = (id) => {
  activeCategory.value = id;
  const el = document.getElementById(`cat-${id}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Auto-update activeCategory on scroll
const setupScrollSpy = () => {
  if (!menuData.value?.categories) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id.replace('cat-', '');
          activeCategory.value = id;
        }
      });
    },
    { rootMargin: '-20% 0px -70% 0px' }
  );
  menuData.value.categories.forEach((cat) => {
    const el = document.getElementById(`cat-${cat.id}`);
    if (el) observer.observe(el);
  });
};

const fetchMenu = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res = await $fetch(`${config.public.apiBase}/api/public/menu/${route.params.tenantSlug}`, {
      query: { locale: selectedLocale.value, currency: selectedCurrency.value },
    });
    menuData.value = res;
    if (!activeCategory.value && res.categories?.length) {
      activeCategory.value = res.categories[0].id;
    }
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// SSR fetch
if (process.server) {
  try {
    const res = await $fetch(`${config.apiBase}/api/public/menu/${route.params.tenantSlug}`, {
      query: { locale: selectedLocale.value, currency: selectedCurrency.value },
    });
    menuData.value = res;
    if (res.categories?.length) activeCategory.value = res.categories[0].id;
  } catch {
    throw showError({ statusCode: 404, message: 'Restoran bulunamadı' });
  }
}

onMounted(async () => {
  const supportedLocales = ['tr', 'en', 'de', 'ar'];
  const browserLang = navigator.language?.slice(0, 2).toLowerCase();
  if (supportedLocales.includes(browserLang)) {
    selectedLocale.value = browserLang;
  }
  if (!menuData.value) await fetchMenu();
  nextTick(setupScrollSpy);
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.drawer-enter-active,
.drawer-leave-active { transition: opacity 0.25s ease; }
.drawer-enter-active .relative,
.drawer-leave-active .relative { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.drawer-enter-from,
.drawer-leave-to { opacity: 0; }
.drawer-enter-from .relative,
.drawer-leave-to .relative { transform: translateY(100%); }
@media (min-width: 768px) {
  .drawer-enter-from .relative,
  .drawer-leave-to .relative { transform: scale(0.95); }
}
</style>
