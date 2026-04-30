<template>
  <div>
    <AdminPageHeader title="Mesajlar" description="İletişim formu mesajları.">
      <div class="flex items-center gap-2">
        <button @click="filter = 'all'" :class="filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'" class="px-3 py-2 rounded-lg text-sm font-medium">
          Tümü
        </button>
        <button @click="filter = 'unread'" :class="filter === 'unread' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'" class="px-3 py-2 rounded-lg text-sm font-medium">
          Okunmamış
          <span v-if="unreadCount > 0" class="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{{ unreadCount }}</span>
        </button>
      </div>
    </AdminPageHeader>

    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin h-8 w-8 border-4 border-slate-200 border-t-indigo-500 rounded-full"></div>
    </div>

    <div v-else-if="messages.length === 0" class="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-500">
      Mesaj yok.
    </div>

    <div v-else class="grid lg:grid-cols-3 gap-5">
      <!-- List -->
      <div class="lg:col-span-1 bg-white rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
        <button
          v-for="m in messages"
          :key="m.id"
          @click="select(m)"
          :class="selected?.id === m.id ? 'bg-indigo-50' : 'hover:bg-slate-50'"
          class="w-full text-left px-4 py-3 transition relative"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="font-medium text-slate-800 truncate">{{ m.name }}</span>
            <span v-if="!m.isRead" class="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></span>
          </div>
          <div class="text-xs text-slate-500 truncate">{{ m.subject || m.email }}</div>
          <div class="text-xs text-slate-400 mt-1">{{ formatDate(m.createdAt) }}</div>
        </button>
      </div>

      <!-- Detail -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-6">
        <div v-if="!selected" class="flex items-center justify-center h-full text-slate-400 py-20">
          Bir mesaj seçin
        </div>
        <div v-else>
          <div class="flex items-start justify-between mb-5">
            <div>
              <h2 class="text-xl font-bold text-slate-800">{{ selected.subject || '(konu yok)' }}</h2>
              <div class="text-sm text-slate-500 mt-1">
                <span class="font-medium text-slate-700">{{ selected.name }}</span> · {{ selected.email }}
                <span v-if="selected.phone"> · {{ selected.phone }}</span>
              </div>
              <div class="text-xs text-slate-400 mt-1">
                {{ formatDate(selected.createdAt) }} · Dil: {{ selected.locale }}
                <span v-if="selected.ipAddress"> · IP: {{ selected.ipAddress }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="toggleRead(selected)" class="px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
                {{ selected.isRead ? 'Okunmadı işaretle' : 'Okundu işaretle' }}
              </button>
              <button @click="remove(selected.id)" class="px-3 py-1.5 text-red-500 border border-red-200 rounded-lg text-sm hover:bg-red-50">Sil</button>
            </div>
          </div>
          <div class="bg-slate-50 rounded-xl p-5 text-slate-800 whitespace-pre-wrap leading-relaxed">{{ selected.message }}</div>

          <a :href="`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || '')}`"
             class="inline-block mt-5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            E-posta ile yanıtla
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IContactMessage } from '~/types';

definePageMeta({ layout: 'admin' });

const auth = useAuthStore();
const api = useApi();

const messages = ref<IContactMessage[]>([]);
const loading = ref<boolean>(false);
const selected = ref<IContactMessage | null>(null);
const filter = ref<'all' | 'unread'>('all');
const unreadCount = ref<number>(0);

watch(filter, () => void load());

async function load(): Promise<void> {
  loading.value = true;
  try {
    const url = filter.value === 'unread' ? '/contact/messages?unread=true' : '/contact/messages';
    messages.value = await api.get<IContactMessage[]>(url);
    if (selected.value) {
      selected.value = messages.value.find((m) => m.id === selected.value!.id) ?? null;
    }
    await loadUnreadCount();
  } catch { messages.value = []; }
  finally { loading.value = false; }
}

async function loadUnreadCount(): Promise<void> {
  try {
    const res = await api.get<{ unread: number }>('/contact/messages/unread-count');
    unreadCount.value = res.unread;
  } catch { /* ignore */ }
}

async function select(m: IContactMessage): Promise<void> {
  selected.value = m;
  if (!m.isRead) {
    try {
      await api.patch<IContactMessage, { isRead: boolean }>(`/contact/messages/${m.id}/read`, { isRead: true });
      m.isRead = true;
      await loadUnreadCount();
    } catch { /* ignore */ }
  }
}

async function toggleRead(m: IContactMessage): Promise<void> {
  try {
    const updated = await api.patch<IContactMessage, { isRead: boolean }>(`/contact/messages/${m.id}/read`, { isRead: !m.isRead });
    m.isRead = updated.isRead;
    await loadUnreadCount();
  } catch { /* ignore */ }
}

async function remove(id: string): Promise<void> {
  if (!confirm('Bu mesajı silmek istediğinden emin misin?')) return;
  try {
    await api.delete(`/contact/messages/${id}`);
    selected.value = null;
    await load();
  } catch { alert('Silinemedi.'); }
}

function formatDate(s: string): string {
  try { return new Date(s).toLocaleString('tr-TR'); } catch { return s; }
}

onMounted(async () => {
  if (!auth.token) return navigateTo('/admin/login');
  if (auth.token && !auth.user) { try { await auth.fetchUser(); } catch {} }
  if (!auth.user) return navigateTo('/admin/login');
  if (!auth.isSuperAdmin) return navigateTo('/admin/dashboard');
  await load();
});
</script>
