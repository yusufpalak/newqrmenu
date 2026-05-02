<template>
  <div class="min-h-screen" style="background-color: #F7F5F0;">

    <!-- Hero Header -->
    <header class="relative bg-stone-900 text-white overflow-hidden">
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900"></div>
        <div class="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
      </div>

      <div class="relative z-10 max-w-5xl mx-auto px-5 pt-10 pb-10">
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

      </div>
    </header>

    <!-- Sticky Category Nav -->
    <nav v-if="menuData?.categories?.length" class="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-white/5 shadow-lg">
      <div class="max-w-5xl mx-auto relative">

        <!-- Pills scroll container -->
        <div ref="pillsContainerRef" class="overflow-x-auto scrollbar-hide py-3 px-4" @scroll="updatePillArrows">
          <div class="flex gap-2" style="width: max-content;">
            <button
              v-for="cat in menuData?.categories"
              :key="cat.id"
              type="button"
              :data-cat-id="cat.id"
              :aria-current="activeCategory === cat.id ? 'true' : undefined"
              @click="scrollToCategory(cat.id)"
              :class="[
                'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                activeCategory === cat.id
                  ? 'bg-amber-400 text-stone-900 shadow-lg shadow-amber-400/25'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white'
              ]"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- Left gradient + arrow (clickable overlay) -->
        <Transition name="fade-arrow">
          <button
            v-show="showLeftArrow"
            @click="scrollPills(-1)"
            aria-label="Geri"
            class="absolute left-0 top-0 h-full w-14 flex items-center justify-start pl-2
                   bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent
                   text-white/50 hover:text-white/90 transition-colors duration-200"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </Transition>

        <!-- Right gradient + arrow (clickable overlay) -->
        <Transition name="fade-arrow">
          <button
            v-show="showRightArrow"
            @click="scrollPills(1)"
            aria-label="İleri"
            class="absolute right-0 top-0 h-full w-14 flex items-center justify-end pr-2
                   bg-gradient-to-l from-stone-900 via-stone-900/80 to-transparent
                   text-white/50 hover:text-white/90 transition-colors duration-200"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Transition>

      </div>
    </nav>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-10 h-10 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
      <p class="text-stone-400 text-sm">{{ t('loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-5xl mx-auto px-5 py-16 text-center">
      <p class="text-stone-500 text-lg">{{ t('notFound') }}</p>
    </div>

    <!-- Subscription Expired State -->
    <div v-else-if="subscriptionExpired" class="flex flex-col items-center justify-center py-32 px-6 text-center">
      <div class="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
        <svg class="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V7m0 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-stone-800 mb-3">Menü Şu An Kullanılamıyor</h2>
      <p class="text-stone-500 text-base max-w-sm leading-relaxed">Bu restoranın dijital menüsü geçici olarak askıya alınmıştır. Daha fazla bilgi için restoranla iletişime geçin.</p>
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
              <h3 class="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                {{ sub.name }}
              </h3>
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
                <div v-if="selectedProduct.nutrition.calories != null" class="bg-orange-50 rounded-xl p-3 text-center">
                  <p class="text-lg font-bold text-orange-600">{{ selectedProduct.nutrition.calories }}</p>
                  <p class="text-xs text-orange-500 mt-0.5">kcal</p>
                </div>
                <div v-if="selectedProduct.nutrition.protein != null" class="bg-blue-50 rounded-xl p-3 text-center">
                  <p class="text-lg font-bold text-blue-600">{{ selectedProduct.nutrition.protein }}g</p>
                  <p class="text-xs text-blue-500 mt-0.5">{{ t('protein') }}</p>
                </div>
                <div v-if="selectedProduct.nutrition.carbohydrate != null" class="bg-yellow-50 rounded-xl p-3 text-center">
                  <p class="text-lg font-bold text-yellow-600">{{ selectedProduct.nutrition.carbohydrate }}g</p>
                  <p class="text-xs text-yellow-500 mt-0.5">{{ t('carbs') }}</p>
                </div>
                <div v-if="selectedProduct.nutrition.fat != null" class="bg-red-50 rounded-xl p-3 text-center">
                  <p class="text-lg font-bold text-red-600">{{ selectedProduct.nutrition.fat }}g</p>
                  <p class="text-xs text-red-500 mt-0.5">{{ t('fat') }}</p>
                </div>
                <div v-if="selectedProduct.nutrition.sugar != null" class="bg-pink-50 rounded-xl p-3 text-center">
                  <p class="text-lg font-bold text-pink-600">{{ selectedProduct.nutrition.sugar }}g</p>
                  <p class="text-xs text-pink-500 mt-0.5">{{ t('sugar') }}</p>
                </div>
                <div v-if="selectedProduct.nutrition.salt != null" class="bg-stone-50 rounded-xl p-3 text-center">
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

    <!-- Scroll to Top Button -->
    <Transition name="scroll-top">
      <button
        v-if="showScrollTop"
        @click="scrollToTop"
        aria-label="Yukarı çık"
        class="fixed bottom-6 right-6 z-40 w-12 h-12 bg-stone-900 hover:bg-amber-500 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<!-- Product Card Component -->
<script lang="ts">
const ProductCard = defineComponent({
  props: { product: Object, formatImageUrl: Function, featuredLabel: String },
  emits: ['click'],
  setup(props, { emit }) {
    const formatPrice = (amount: string | number | null | undefined, symbol: string | null | undefined): string => {
      if (!amount) return '';
      return `${symbol || ''} ${parseFloat(String(amount)).toFixed(2)}`;
    };
    return () => {
      const p = props.product as IPublicProduct | undefined;
      if (!p) return h('div', {});
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
                src: (props.formatImageUrl as (s: string | null) => string)(p.image ?? null),
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

<script setup lang="ts">
import type { IPublicMenuResponse, IPublicProduct } from '~/types';
definePageMeta({ layout: false });

const route = useRoute();
const config = useRuntimeConfig();

const menuData = ref<IPublicMenuResponse | null>(null);
const selectedLocale = ref<string>('tr');
const selectedCurrency = ref<string>('TRY');
const activeCategory = ref<string | null>(null);
const selectedProduct = ref<IPublicProduct | null>(null);
const loading = ref<boolean>(false);
const error = ref<boolean>(false);
const subscriptionExpired = ref<boolean>(false);

const pillsContainerRef = ref<HTMLElement | null>(null);
const showLeftArrow = ref(false);
const showRightArrow = ref(false);
const showScrollTop = ref(false);

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleWindowScroll = () => {
  showScrollTop.value = window.scrollY > 400;
};

const updatePillArrows = () => {
  const el = pillsContainerRef.value;
  if (!el) return;
  showLeftArrow.value = el.scrollLeft > 8;
  showRightArrow.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 8;
};

const scrollPills = (dir: number) => {
  const el = pillsContainerRef.value;
  if (!el) return;
  el.scrollBy({ left: dir * 160, behavior: 'smooth' });
  setTimeout(updatePillArrows, 350);
};

const uiTranslations: Record<string, Record<string, string>> = {
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

const t = (key: string): string => uiTranslations[selectedLocale.value]?.[key] ?? uiTranslations['tr']?.[key] ?? key;

const formatPrice = (amount: string | number | null | undefined, symbol: string | null | undefined): string => {
  if (!amount) return '';
  return `${symbol || ''} ${parseFloat(String(amount)).toFixed(2)}`;
};

const formatImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${config.public.apiBase}${path}`;
};

const openProduct = (p: IPublicProduct): void => { selectedProduct.value = p; };

const scrollActivePill = (id: string) => {
  const container = pillsContainerRef.value;
  if (!container) return;
  const btn = container.querySelector<HTMLElement>(`[data-cat-id="${id}"]`);
  if (!btn) return;
  const containerLeft = container.getBoundingClientRect().left;
  const btnLeft = btn.getBoundingClientRect().left;
  const offset = btnLeft - containerLeft - 16; // 16px left breathing room
  container.scrollBy({ left: offset, behavior: 'smooth' });
  setTimeout(updatePillArrows, 350);
};

const scrollToCategory = (id: string) => {
  activeCategory.value = id;
  scrollActivePill(id);
  const el = document.getElementById(`cat-${id}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

watch(activeCategory, (id) => {
  if (id) scrollActivePill(id);
});

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
  subscriptionExpired.value = false;
  try {
    const res = await $fetch<IPublicMenuResponse>(`${config.public.apiBase}/api/public/menu/${route.params.tenantSlug}`, {
      query: { locale: selectedLocale.value, currency: selectedCurrency.value },
    });
    menuData.value = res;
    if (!activeCategory.value && res.categories?.length) {
      activeCategory.value = res.categories[0].id;
    }
  } catch (e: any) {
    if (e?.statusCode === 403 || e?.status === 403) {
      subscriptionExpired.value = true;
    } else {
      error.value = true;
    }
  } finally {
    loading.value = false;
  }
};

// SSR fetch
if (process.server) {
  try {
    const res = await $fetch<IPublicMenuResponse>(`${config.apiBase}/api/public/menu/${route.params.tenantSlug}`, {
      query: { locale: selectedLocale.value, currency: selectedCurrency.value },
    });
    menuData.value = res;
    if (res.categories?.length) activeCategory.value = res.categories[0].id;
  } catch (e: any) {
    const status = e?.statusCode ?? e?.status ?? e?.response?.status;
    if (status === 403) {
      subscriptionExpired.value = true;
    } else {
      throw showError({ statusCode: 404, message: 'Restoran bulunamadı' });
    }
  }
}

onMounted(async () => {
  const supportedLocales = ['tr', 'en', 'de', 'ar'];
  const browserLang = navigator.language?.slice(0, 2).toLowerCase();
  const needsRefetch = supportedLocales.includes(browserLang) && browserLang !== selectedLocale.value;
  if (supportedLocales.includes(browserLang)) {
    selectedLocale.value = browserLang;
  }
  if (!menuData.value || needsRefetch) await fetchMenu();
  nextTick(() => {
    setupScrollSpy();
    updatePillArrows();
  });
  window.addEventListener('scroll', handleWindowScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleWindowScroll);
});

// ─── SEO ──────────────────────────────────────────────────────────────────────
const tenantName = computed<string>(() => menuData.value?.tenant?.name || 'Restoran');
const tenantDesc = computed<string>(() => menuData.value?.tenant?.description || '');
const pageTitle = computed<string>(() => `${tenantName.value} — ${t('digitalMenu')}`);
const pageDescription = computed<string>(() => {
  if (tenantDesc.value) return tenantDesc.value;
  const cats = (menuData.value?.categories || []).map((c) => c.name).filter(Boolean).slice(0, 6).join(', ');
  return cats
    ? `${tenantName.value} ${t('digitalMenu').toLowerCase()}: ${cats}.`
    : `${tenantName.value} ${t('digitalMenu').toLowerCase()}.`;
});
const isRtl = computed<boolean>(() => selectedLocale.value === 'ar');
const canonicalUrl = computed<string>(() => {
  const base = (config.public.siteUrl as string | undefined) || '';
  const slug = String(route.params.tenantSlug || '');
  return base ? `${base.replace(/\/$/, '')}/${slug}` : '';
});
const ogImage = computed<string | undefined>(() => {
  const logo = menuData.value?.tenant?.logo;
  return logo ? formatImageUrl(logo) : undefined;
});

useHead(() => ({
  htmlAttrs: {
    lang: selectedLocale.value,
    dir: isRtl.value ? 'rtl' : 'ltr',
  },
  link: canonicalUrl.value ? [{ rel: 'canonical', href: canonicalUrl.value }] : [],
}));

useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  ogTitle: () => pageTitle.value,
  ogDescription: () => pageDescription.value,
  ogType: 'website',
  ogLocale: () => selectedLocale.value,
  ogUrl: () => canonicalUrl.value || undefined,
  ogImage: () => ogImage.value,
  ogSiteName: () => tenantName.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => pageTitle.value,
  twitterDescription: () => pageDescription.value,
  twitterImage: () => ogImage.value,
  robots: 'index,follow',
});

// JSON-LD: Restaurant + Menu structured data
const jsonLd = computed<string>(() => {
  if (!menuData.value) return '';
  const sections = (menuData.value.categories || []).map((cat) => {
    const items: Record<string, unknown>[] = [];
    const pushItem = (p: IPublicProduct): void => {
      items.push({
        '@type': 'MenuItem',
        name: p.name,
        description: p.description || undefined,
        image: p.image ? formatImageUrl(p.image) : undefined,
        offers: p.price
          ? {
              '@type': 'Offer',
              price: p.price.discountedPrice || p.price.amount,
              priceCurrency: p.price.currency?.code,
            }
          : undefined,
      });
    };
    for (const sub of cat.subCategories || []) for (const p of sub.products || []) pushItem(p);
    for (const p of cat.products || []) pushItem(p);
    return {
      '@type': 'MenuSection',
      name: cat.name,
      description: cat.description || undefined,
      hasMenuItem: items,
    };
  });

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: tenantName.value,
    description: tenantDesc.value || undefined,
    image: ogImage.value,
    url: canonicalUrl.value || undefined,
    inLanguage: selectedLocale.value,
    hasMenu: {
      '@type': 'Menu',
      name: t('digitalMenu'),
      inLanguage: selectedLocale.value,
      hasMenuSection: sections,
    },
  };
  return JSON.stringify(data);
});

useHead(() => ({
  script: jsonLd.value
    ? [{ type: 'application/ld+json', innerHTML: jsonLd.value }]
    : [],
}));
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }

.scroll-top-enter-active,
.scroll-top-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.scroll-top-enter-from,
.scroll-top-leave-to { opacity: 0; transform: translateY(12px); }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.fade-arrow-enter-active,
.fade-arrow-leave-active { transition: opacity 0.2s ease; }
.fade-arrow-enter-from,
.fade-arrow-leave-to { opacity: 0; }

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
