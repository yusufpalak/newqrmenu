<template>
  <div>
    <AdminPageHeader title="Blog" description="Blog yazılarını yönet ve otomatik çeviri yap.">
      <button @click="openCreate" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Yeni Yazı
      </button>
    </AdminPageHeader>

    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin h-8 w-8 border-4 border-slate-200 border-t-indigo-500 rounded-full"></div>
    </div>

    <div v-else-if="posts.length === 0" class="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-500">
      Henüz blog yazısı yok.
    </div>

    <div v-else class="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-slate-600">
          <tr>
            <th class="text-left px-4 py-3 font-medium">Görsel</th>
            <th class="text-left px-4 py-3 font-medium">Başlık</th>
            <th class="text-left px-4 py-3 font-medium">Slug</th>
            <th class="text-left px-4 py-3 font-medium">Durum</th>
            <th class="text-left px-4 py-3 font-medium">Görüntülenme</th>
            <th class="text-right px-4 py-3 font-medium">İşlem</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in posts" :key="p.id" class="border-t border-slate-100">
            <td class="px-4 py-3">
              <div class="w-12 h-9 bg-slate-100 rounded overflow-hidden">
                <img v-if="p.coverImage" :src="p.coverImage" alt="" class="w-full h-full object-cover" />
              </div>
            </td>
            <td class="px-4 py-3 font-medium text-slate-800">{{ titleOf(p) }}</td>
            <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ p.slug }}</td>
            <td class="px-4 py-3">
              <span :class="p.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'" class="px-2 py-0.5 rounded-full text-xs font-medium">
                {{ p.isPublished ? 'Yayında' : 'Taslak' }}
              </span>
            </td>
            <td class="px-4 py-3 text-slate-500">{{ p.viewCount }}</td>
            <td class="px-4 py-3 text-right">
              <button @click="openEdit(p)" class="px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded text-sm font-medium">Düzenle</button>
              <button @click="remove(p.id)" class="px-3 py-1 text-red-500 hover:bg-red-50 rounded text-sm font-medium">Sil</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl w-full max-w-4xl my-8">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 class="text-lg font-semibold">{{ isEditing ? 'Yazıyı Düzenle' : 'Yeni Yazı' }}</h2>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form @submit.prevent="save" class="p-6 space-y-5">
          <!-- Cover -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Kapak Görseli</label>
            <div class="flex items-center gap-4">
              <div class="w-32 h-20 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                <img v-if="form.coverImage" :src="form.coverImage" alt="" class="w-full h-full object-cover" />
                <span v-else class="text-slate-300 text-3xl">📰</span>
              </div>
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
              <button type="button" @click="fileInput?.click()" :disabled="uploading" class="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50">
                {{ uploading ? 'Yükleniyor…' : 'Görsel Seç' }}
              </button>
              <button v-if="form.coverImage" type="button" @click="form.coverImage = ''" class="text-red-500 text-sm">Kaldır</button>
            </div>
          </div>

          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Kaynak Dil</label>
              <select v-model="form.sourceLocale" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option v-for="code in HOME_LOCALES" :key="code" :value="code">{{ localeLabels[code] }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Kanonik Slug</label>
              <input v-model="form.slug" placeholder="otomatik oluşturulur" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Etiketler (virgülle)</label>
              <input v-model="form.tags" placeholder="qr, menü, dijital" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
          </div>

          <div class="flex items-center gap-6">
            <label class="flex items-center gap-2 text-sm">
              <input v-model="form.isPublished" type="checkbox" class="rounded" /> Yayınla
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input v-model="autoTranslate" type="checkbox" class="rounded" />
              Eksik dilleri DeepL ile otomatik çevir
            </label>
          </div>

          <!-- Locale tabs -->
          <div class="border border-slate-200 rounded-xl overflow-hidden">
            <div class="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
              <button
                v-for="code in HOME_LOCALES"
                :key="code"
                type="button"
                @click="activeLocale = code"
                :class="activeLocale === code ? 'bg-white text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-800'"
                class="px-4 py-2.5 text-sm font-medium whitespace-nowrap"
              >
                {{ localeLabels[code] }}
                <span v-if="code === form.sourceLocale" class="ml-1 text-xs text-indigo-500">(kaynak)</span>
                <span v-else-if="!hasContent(code)" class="ml-1 text-xs text-slate-400">○</span>
              </button>
            </div>
            <div class="p-5 space-y-3">
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Başlık *</label>
                <input v-model="trMap[activeLocale].title" :required="activeLocale === form.sourceLocale" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Slug</label>
                <input v-model="trMap[activeLocale].slug" placeholder="otomatik" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Özet</label>
                <textarea v-model="trMap[activeLocale].excerpt" rows="2" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"></textarea>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">İçerik (HTML destekli) *</label>
                <textarea v-model="trMap[activeLocale].content" :required="activeLocale === form.sourceLocale" rows="10" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"></textarea>
              </div>
              <div class="grid md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">SEO Başlık</label>
                  <input v-model="trMap[activeLocale].metaTitle" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">SEO Açıklama</label>
                  <input v-model="trMap[activeLocale].metaDescription" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-3 border-t border-slate-200">
            <button type="button" @click="closeModal" class="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">İptal</button>
            <button type="submit" :disabled="saving" class="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50">
              {{ saving ? 'Kaydediliyor…' : isEditing ? 'Güncelle' : 'Kaydet' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HOME_LOCALES, type HomeLocale } from '~/composables/useHomeI18n';
import type { IBlogPost, IBlogTranslation, ICreateBlogPost, IUploadResponse } from '~/types';

definePageMeta({ layout: 'admin' });

const auth = useAuthStore();
const api = useApi();

const localeLabels: Record<HomeLocale, string> = {
  tr: 'Türkçe', en: 'English', es: 'Español', ru: 'Русский', de: 'Deutsch', fr: 'Français', it: 'Italiano',
};

interface ITrForm {
  locale: HomeLocale;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
}

const posts = ref<IBlogPost[]>([]);
const loading = ref<boolean>(false);
const showModal = ref<boolean>(false);
const isEditing = ref<boolean>(false);
const editingId = ref<string | null>(null);
const saving = ref<boolean>(false);
const uploading = ref<boolean>(false);
const autoTranslate = ref<boolean>(true);
const activeLocale = ref<HomeLocale>('tr');
const fileInput = ref<HTMLInputElement | null>(null);

const form = ref<{
  slug: string;
  sourceLocale: HomeLocale;
  coverImage: string;
  isPublished: boolean;
  tags: string;
}>({
  slug: '',
  sourceLocale: 'tr',
  coverImage: '',
  isPublished: false,
  tags: '',
});

function emptyTr(code: HomeLocale): ITrForm {
  return { locale: code, slug: '', title: '', excerpt: '', content: '', metaTitle: '', metaDescription: '' };
}

const trMap = ref<Record<HomeLocale, ITrForm>>({
  tr: emptyTr('tr'), en: emptyTr('en'), es: emptyTr('es'), ru: emptyTr('ru'),
  de: emptyTr('de'), fr: emptyTr('fr'), it: emptyTr('it'),
});

function hasContent(code: HomeLocale): boolean {
  const t = trMap.value[code];
  return Boolean(t.title || t.content);
}

function titleOf(p: IBlogPost): string {
  return p.translations?.find((t) => t.locale === p.sourceLocale)?.title
    ?? p.translations?.[0]?.title
    ?? p.slug;
}

async function load(): Promise<void> {
  loading.value = true;
  try { posts.value = await api.get<IBlogPost[]>('/blog'); }
  catch { posts.value = []; }
  finally { loading.value = false; }
}

function resetForm(): void {
  form.value = { slug: '', sourceLocale: 'tr', coverImage: '', isPublished: false, tags: '' };
  for (const code of HOME_LOCALES) trMap.value[code] = emptyTr(code);
  autoTranslate.value = true;
  activeLocale.value = 'tr';
}

function openCreate(): void {
  isEditing.value = false;
  editingId.value = null;
  resetForm();
  showModal.value = true;
}

function openEdit(p: IBlogPost): void {
  isEditing.value = true;
  editingId.value = p.id;
  form.value = {
    slug: p.slug,
    sourceLocale: (p.sourceLocale as HomeLocale) ?? 'tr',
    coverImage: p.coverImage ?? '',
    isPublished: p.isPublished,
    tags: p.tags ?? '',
  };
  for (const code of HOME_LOCALES) trMap.value[code] = emptyTr(code);
  for (const t of p.translations ?? []) {
    if (HOME_LOCALES.includes(t.locale as HomeLocale)) {
      trMap.value[t.locale as HomeLocale] = {
        locale: t.locale as HomeLocale,
        slug: t.slug ?? '',
        title: t.title ?? '',
        excerpt: t.excerpt ?? '',
        content: t.content ?? '',
        metaTitle: t.metaTitle ?? '',
        metaDescription: t.metaDescription ?? '',
      };
    }
  }
  autoTranslate.value = false;
  activeLocale.value = form.value.sourceLocale;
  showModal.value = true;
}

function closeModal(): void {
  showModal.value = false;
  saving.value = false;
}

async function onFileChange(e: Event): Promise<void> {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'blog');
    const res = await api.upload<IUploadResponse>('/uploads', fd);
    form.value.coverImage = res.url;
  } catch { alert('Görsel yüklenemedi.'); }
  finally {
    uploading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
}

async function save(): Promise<void> {
  saving.value = true;
  try {
    const src = trMap.value[form.value.sourceLocale];
    if (!src.title.trim() || !src.content.trim()) {
      alert('Kaynak dilde başlık ve içerik zorunludur.');
      saving.value = false;
      return;
    }

    const translations: Pick<IBlogTranslation, 'locale' | 'slug' | 'title' | 'excerpt' | 'content' | 'metaTitle' | 'metaDescription'>[] = [];
    for (const code of HOME_LOCALES) {
      const t = trMap.value[code];
      if (code === form.value.sourceLocale || hasContent(code)) {
        translations.push({
          locale: code,
          slug: t.slug.trim() || (null as unknown as string),
          title: t.title.trim(),
          excerpt: t.excerpt.trim() || null,
          content: t.content,
          metaTitle: t.metaTitle.trim() || null,
          metaDescription: t.metaDescription.trim() || null,
        });
      }
    }

    const payload: ICreateBlogPost = {
      slug: form.value.slug.trim() || undefined,
      sourceLocale: form.value.sourceLocale,
      coverImage: form.value.coverImage || undefined,
      isPublished: form.value.isPublished,
      tags: form.value.tags.trim() || undefined,
      autoTranslate: autoTranslate.value,
      translations,
    };

    if (isEditing.value && editingId.value) {
      await api.patch<IBlogPost, ICreateBlogPost>(`/blog/${editingId.value}`, payload);
    } else {
      await api.post<IBlogPost, ICreateBlogPost>('/blog', payload);
    }

    await load();
    closeModal();
  } catch (err: unknown) {
    const msg = (err as { data?: { message?: string | string[] } } | undefined)?.data?.message;
    alert('Kaydedilemedi: ' + (Array.isArray(msg) ? msg.join(', ') : msg ?? ''));
  } finally {
    saving.value = false;
  }
}

async function remove(id: string): Promise<void> {
  if (!confirm('Bu yazıyı silmek istediğinden emin misin?')) return;
  try { await api.delete(`/blog/${id}`); await load(); }
  catch { alert('Silinemedi.'); }
}

onMounted(async () => {
  if (!auth.token) return navigateTo('/admin/login');
  if (auth.token && !auth.user) { try { await auth.fetchUser(); } catch {} }
  if (!auth.user) return navigateTo('/admin/login');
  if (!auth.isSuperAdmin) return navigateTo('/admin/dashboard');
  await load();
});
</script>
