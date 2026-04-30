<template>
  <div>
    <!-- Header -->
    <AdminPageHeader title="Çeviriler" description="Menü içeriği için gelen çeviri taleplerini görüntüle ve yönet." />

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin h-8 w-8 border-4 border-slate-200 border-t-indigo-500 rounded-full"></div>
    </div>

    <!-- List -->
    <div v-else-if="requests.length > 0" class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="divide-y divide-slate-100">
        <div v-for="req in requests" :key="req.id" class="flex items-center justify-between p-4 hover:bg-slate-50 transition">
          <div class="flex items-center gap-4">
            <div class="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-800">{{ req.key || req.field || '—' }}</p>
              <p class="text-xs text-slate-400">{{ req.locale || req.language }} · {{ req.status || 'Beklemede' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span :class="{
              'bg-yellow-50 text-yellow-700 border-yellow-200': req.status === 'pending',
              'bg-emerald-50 text-emerald-700 border-emerald-200': req.status === 'approved',
              'bg-red-50 text-red-700 border-red-200': req.status === 'rejected',
            }" class="px-2 py-0.5 rounded-full text-xs font-medium border">
              {{ req.status === 'pending' ? 'Beklemede' : req.status === 'approved' ? 'Onaylandı' : req.status === 'rejected' ? 'Reddedildi' : req.status }}
            </span>
            <button @click="approveRequest(req.id)" class="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition" title="Onayla">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button @click="rejectRequest(req.id)" class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition" title="Reddet">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="bg-white rounded-xl border border-slate-100 shadow-sm text-center py-16">
      <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      </div>
      <h3 class="font-semibold text-slate-700 mb-1">Çeviri talebi yok</h3>
      <p class="text-sm text-slate-400">Şu an bekleyen çeviri talebi bulunmuyor.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' });

const api = useApi();
const requests = ref([]);
const loading = ref(false);

const loadRequests = async () => {
  loading.value = true;
  try {
    requests.value = await api.get('/translation-requests');
  } catch {
    requests.value = [];
  } finally {
    loading.value = false;
  }
};

const approveRequest = async (id) => {
  try {
    await api.patch(`/translation-requests/${id}`, { status: 'approved' });
    await loadRequests();
  } catch { alert('İşlem gerçekleştirilemedi.'); }
};

const rejectRequest = async (id) => {
  try {
    await api.patch(`/translation-requests/${id}`, { status: 'rejected' });
    await loadRequests();
  } catch { alert('İşlem gerçekleştirilemedi.'); }
};

onMounted(loadRequests);
</script>
