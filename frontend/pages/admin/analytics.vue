<template>
  <div>
    <AdminPageHeader title="Analitik" description="QR tarama istatistikleri ve en popüler ürünler." />

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin h-8 w-8 border-4 border-slate-200 border-t-indigo-500 rounded-full"></div>
    </div>

    <template v-else-if="data">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p class="text-xs text-slate-400 mb-1">Toplam Tarama</p>
          <p class="text-3xl font-bold text-slate-800">{{ data.total.toLocaleString('tr-TR') }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p class="text-xs text-slate-400 mb-1">Bugün</p>
          <p class="text-3xl font-bold text-amber-600">{{ data.today.toLocaleString('tr-TR') }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p class="text-xs text-slate-400 mb-1">Son 30 Gün</p>
          <p class="text-3xl font-bold text-indigo-600">{{ last30Total.toLocaleString('tr-TR') }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p class="text-xs text-slate-400 mb-1">Günlük Ort.</p>
          <p class="text-3xl font-bold text-emerald-600">{{ dailyAvg }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chart -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 class="font-semibold text-slate-800 mb-4">Son 30 Gün — Günlük Tarama</h3>
          <div class="flex items-end gap-1 h-40">
            <div
              v-for="day in chartData" :key="day.label"
              class="flex-1 flex flex-col items-center gap-1 group"
            >
              <span class="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition">{{ day.count }}</span>
              <div
                class="w-full rounded-t-sm bg-indigo-400 hover:bg-indigo-500 transition-all"
                :style="{ height: `${day.pct}%`, minHeight: day.count > 0 ? '4px' : '0' }"
                :title="`${day.label}: ${day.count}`"
              ></div>
              <span v-if="day.showLabel" class="text-[9px] text-slate-400 truncate">{{ day.shortLabel }}</span>
              <span v-else class="text-[9px] opacity-0">x</span>
            </div>
          </div>
          <div v-if="!data.daily?.length" class="text-center py-8 text-slate-400 text-sm">
            Henüz tarama verisi yok.
          </div>
        </div>

        <!-- Top Products -->
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 class="font-semibold text-slate-800 mb-4">En Çok İncelenen Ürünler</h3>
          <div v-if="data.topProducts?.length" class="space-y-3">
            <div
              v-for="(p, idx) in data.topProducts" :key="p.id"
              class="flex items-center gap-3"
            >
              <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                :class="idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-100 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'">
                {{ idx + 1 }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-700 truncate">{{ p.name }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-400 rounded-full"
                      :style="{ width: `${maxViews > 0 ? (p.viewCount / maxViews) * 100 : 0}%` }"></div>
                  </div>
                  <span class="text-xs text-slate-400 flex-shrink-0">{{ p.viewCount }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-slate-400 text-sm">
            Henüz ürün görüntülemesi yok.
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' });

const api = useApi();
const auth = useAuthStore();
const data = ref<any>(null);
const loading = ref(true);

onMounted(async () => {
  if (!auth.token) return navigateTo('/admin/login');
  if (!auth.user) { try { await auth.fetchUser(); } catch {} }
  const tenantId = auth.currentTenant?.id ?? auth.user?.tenant?.id;
  if (!tenantId) { loading.value = false; return; }
  try {
    data.value = await api.get(`/public/analytics/${tenantId}`);
  } catch { /* ignore */ }
  finally { loading.value = false; }
});

const last30Total = computed(() =>
  (data.value?.daily ?? []).reduce((sum: number, d: any) => sum + Number(d.count), 0)
);

const dailyAvg = computed(() => {
  const days = data.value?.daily?.length ?? 0;
  if (!days) return '—';
  return Math.round(last30Total.value / days).toLocaleString('tr-TR');
});

const maxViews = computed(() =>
  Math.max(...(data.value?.topProducts ?? []).map((p: any) => p.viewCount ?? 0), 1)
);

const chartData = computed(() => {
  const raw: { day: string; count: string }[] = data.value?.daily ?? [];
  // Build last 30 days scaffold
  const days: { label: string; shortLabel: string; showLabel: boolean; count: number; pct: number }[] = [];
  const now = new Date();
  const mapByDay = new Map(raw.map(r => [r.day.slice(0, 10), Number(r.count)]));
  const maxCount = Math.max(...Array.from(mapByDay.values()), 1);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = mapByDay.get(key) ?? 0;
    days.push({
      label: new Date(key).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      shortLabel: new Date(key).toLocaleDateString('tr-TR', { day: 'numeric' }),
      showLabel: i % 7 === 0 || i === 0,
      count,
      pct: Math.round((count / maxCount) * 100),
    });
  }
  return days;
});
</script>
