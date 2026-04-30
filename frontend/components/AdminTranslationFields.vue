<template>
  <div class="border border-slate-200 rounded-xl overflow-hidden">
    <!-- Header toggle -->
    <button
      type="button"
      @click="open = !open"
      class="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition text-left"
    >
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span class="text-sm font-medium text-slate-700">Çeviriler</span>
        <span class="text-xs text-slate-400">(opsiyonel)</span>
        <span v-if="filledCount > 0" class="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded">
          {{ filledCount }}/{{ languages.length }}
        </span>
      </div>
      <svg
        class="w-4 h-4 text-slate-400 transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Content -->
    <div v-if="open" class="border-t border-slate-100 p-4">
      <!-- Language tabs -->
      <div class="flex gap-1 mb-4">
        <button
          v-for="lang in languages"
          :key="lang.code"
          type="button"
          @click="activeLocale = lang.code"
          :class="activeLocale === lang.code
            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
            : 'text-slate-500 border-slate-200 hover:bg-slate-50'"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition"
        >
          <span>{{ lang.flag }}</span>
          {{ lang.label }}
          <span v-if="localData[lang.code]?.name" class="w-1.5 h-1.5 rounded-full bg-indigo-400 ml-0.5"></span>
        </button>
      </div>

      <!-- Single active section -->
      <div v-if="activeLang" class="space-y-3">
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">
            {{ activeLang.label }} · Ad
          </label>
          <input
            :key="activeLocale + '-name'"
            v-model="localData[activeLocale].name"
            type="text"
            :placeholder="`${activeLang.label} dilinde ad`"
            @input="emitValue"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">
            {{ activeLang.label }} · Açıklama
          </label>
          <textarea
            :key="activeLocale + '-desc'"
            v-model="localData[activeLocale].description"
            rows="2"
            :placeholder="`${activeLang.label} dilinde açıklama`"
            @input="emitValue"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm resize-none"
          ></textarea>
        </div>
        <div v-if="withIngredients">
          <label class="block text-xs font-medium text-slate-500 mb-1">
            {{ activeLang.label }} · İçindekiler
          </label>
          <textarea
            :key="activeLocale + '-ingredients'"
            v-model="localData[activeLocale].ingredients"
            rows="2"
            :placeholder="`${activeLang.label} dilinde içindekiler`"
            @input="emitValue"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition outline-none text-sm resize-none"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  withIngredients: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['update:modelValue']);

const languages = [
  { code: 'en', label: 'İngilizce', flag: '🇬🇧' },
  { code: 'de', label: 'Almanca',   flag: '🇩🇪' },
  { code: 'ar', label: 'Arapça',    flag: '🇸🇦' },
];

const open = ref(false);
const activeLocale = ref('en');

const activeLang = computed(() => languages.find(l => l.code === activeLocale.value));

const makeEmpty = () =>
  Object.fromEntries(languages.map(l => [l.code, { name: '', description: '', ingredients: '' }]));

const localData = ref(makeEmpty());

const filledCount = computed(() =>
  languages.filter(l => localData.value[l.code]?.name?.trim()).length
);

let syncing = false;

watch(
  () => props.modelValue,
  (val) => {
    if (syncing) return;
    const fresh = makeEmpty();
    (val || []).forEach(t => {
      if (fresh[t.locale]) {
        fresh[t.locale].name = t.name || '';
        fresh[t.locale].description = t.description || '';
        fresh[t.locale].ingredients = t.ingredients || '';
      }
    });
    localData.value = fresh;
    syncing = true;
    emitValue();
    nextTick(() => { syncing = false; });
  },
  { immediate: true, deep: true }
);

function emitValue() {
  const result = languages
    .filter(l => localData.value[l.code]?.name?.trim())
    .map(l => {
      const entry = {
        locale: l.code,
        name: localData.value[l.code].name.trim(),
        description: localData.value[l.code].description?.trim() || undefined,
      };
      if (props.withIngredients && localData.value[l.code].ingredients?.trim()) {
        entry.ingredients = localData.value[l.code].ingredients.trim();
      }
      return entry;
    });
  emits('update:modelValue', result);
}
</script>
