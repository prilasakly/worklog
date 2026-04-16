<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold text-slate-100">Dashboard</h2>
      <p class="text-sm text-slate-500 mt-0.5">Ringkasan aktivitas logbook kamu</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 lg:p-5"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">{{ stat.label }}</p>
            <p class="text-2xl lg:text-3xl font-bold mt-1.5" :class="stat.color">{{ stat.value }}</p>
          </div>
          <div class="p-2 rounded-xl" :class="stat.bg">
            <component :is="stat.icon" class="w-5 h-5" :class="stat.color" />
          </div>
        </div>
        <p class="text-xs text-slate-600 mt-3 font-mono">{{ stat.sub }}</p>
      </div>
    </div>

    <!-- Filter bulan + Recent Logbook -->
    <div class="bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 lg:p-5 border-b border-[#334155]">
        <h3 class="font-semibold text-slate-200 text-sm">Logbook Terbaru</h3>
        <div class="flex items-center gap-2">
          <select
            v-model="selectedMonth"
            class="bg-[#0f172a] border border-[#334155] text-slate-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-sky-500 transition cursor-pointer"
          >
            <option value="">Semua Bulan</option>
            <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
          <select
            v-model="selectedYear"
            class="bg-[#0f172a] border border-[#334155] text-slate-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-sky-500 transition cursor-pointer"
          >
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="p-10 flex items-center justify-center">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>
          <p class="text-xs text-slate-500">Memuat data…</p>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredLogbook.length === 0" class="p-10 text-center">
        <div class="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p class="text-sm text-slate-500">Belum ada data logbook</p>
      </div>

      <!-- Table Desktop -->
      <div v-else class="hidden md:block overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[#334155]">
              <th class="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide">Kegiatan</th>
              <th class="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide">Tanggal</th>
              <th class="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide">Pemberi Tugas</th>
              <th class="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide">Dokumentasi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, i) in filteredLogbook.slice(0, 10)"
              :key="item.id"
              class="border-b border-[#334155]/50 hover:bg-white/2 transition-colors"
            >
              <td class="px-5 py-3.5 text-slate-200 font-medium max-w-[200px]">
                <span class="line-clamp-1">{{ item.nama_kegiatan }}</span>
              </td>
              <td class="px-5 py-3.5 text-slate-400 font-mono text-xs whitespace-nowrap">{{ formatDate(item.tanggal) }}</td>
              <td class="px-5 py-3.5">
                <span class="inline-flex items-center gap-1.5 bg-sky-500/10 text-sky-400 text-xs px-2.5 py-1 rounded-full border border-sky-500/20">
                  {{ item.pemberi_tugas }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <a
                  v-if="item.dokumentasi_url"
                  :href="item.dokumentasi_url"
                  target="_blank"
                  class="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Lihat
                </a>
                <span v-else class="text-slate-700 text-xs">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden divide-y divide-[#334155]/50">
        <div
          v-for="item in filteredLogbook.slice(0, 10)"
          :key="item.id"
          class="p-4 space-y-2"
        >
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-medium text-slate-200 leading-snug">{{ item.nama_kegiatan }}</p>
            <a
              v-if="item.dokumentasi_url"
              :href="item.dokumentasi_url"
              target="_blank"
              class="text-orange-400 shrink-0"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-mono text-slate-500">{{ formatDate(item.tanggal) }}</span>
            <span class="inline-flex items-center bg-sky-500/10 text-sky-400 text-xs px-2 py-0.5 rounded-full border border-sky-500/20">
              {{ item.pemberi_tugas }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="filteredLogbook.length > 10" class="px-5 py-3 border-t border-[#334155]/50">
        <p class="text-xs text-slate-600 font-mono">+{{ filteredLogbook.length - 10 }} data lainnya — lihat di halaman Logbook</p>
      </div>
    </div>

    <!-- Activity by Assigner Chart -->
    <div class="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 lg:p-5">
      <h3 class="font-semibold text-slate-200 text-sm mb-4">Kegiatan per Pemberi Tugas</h3>
      <div v-if="loading" class="flex justify-center py-6">
        <div class="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>
      </div>
      <div v-else class="space-y-3">
        <div v-for="item in assignerStats" :key="item.nama" class="flex items-center gap-3">
          <p class="text-xs text-slate-400 w-28 shrink-0 truncate">{{ item.nama }}</p>
          <div class="flex-1 bg-[#0f172a] rounded-full h-2 overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-700"
              :style="{ width: `${item.pct}%` }"
            ></div>
          </div>
          <span class="text-xs font-mono text-slate-400 w-6 text-right">{{ item.count }}</span>
        </div>
        <p v-if="assignerStats.length === 0" class="text-xs text-slate-600 text-center py-2">Belum ada data</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from "vue";
import { useApi } from "../composables/useApi.js";

const { getLogbook } = useApi();

const logbook = ref([]);
const loading = ref(true);
const selectedMonth = ref("");
const selectedYear = ref(new Date().getFullYear());

const months = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const years = computed(() => {
  const cur = new Date().getFullYear();
  return [cur - 1, cur, cur + 1];
});

const filteredLogbook = computed(() => {
  return logbook.value.filter((item) => {
    if (!item.tanggal) return false;
    const [y, m] = item.tanggal.split("-");
    const yearOk = String(y) === String(selectedYear.value);
    const monthOk = !selectedMonth.value || m === selectedMonth.value;
    return yearOk && monthOk;
  });
});

const stats = computed(() => {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthCount = logbook.value.filter(
    (i) => i.tanggal && i.tanggal.startsWith(thisMonth)
  ).length;
  const withDocs = logbook.value.filter((i) => i.dokumentasi_url).length;
  const assigners = [...new Set(logbook.value.map((i) => i.pemberi_tugas).filter(Boolean))].length;

  return [
    {
      label: "Total Kegiatan",
      value: logbook.value.length,
      sub: "Semua waktu",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      icon: IconList,
    },
    {
      label: "Bulan Ini",
      value: thisMonthCount,
      sub: new Date().toLocaleString("id-ID", { month: "long", year: "numeric" }),
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      icon: IconCalendar,
    },
    {
      label: "Dengan Dokumentasi",
      value: withDocs,
      sub: `${logbook.value.length ? Math.round((withDocs / logbook.value.length) * 100) : 0}% dari total`,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      icon: IconImage,
    },
    {
      label: "Pemberi Tugas",
      value: assigners,
      sub: "Unik",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      icon: IconUser,
    },
  ];
});

const assignerStats = computed(() => {
  const counts = {};
  filteredLogbook.value.forEach((i) => {
    if (i.pemberi_tugas) counts[i.pemberi_tugas] = (counts[i.pemberi_tugas] || 0) + 1;
  });
  const max = Math.max(...Object.values(counts), 1);
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([nama, count]) => ({ nama, count, pct: Math.round((count / max) * 100) }));
});

function formatDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const monthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return `${parseInt(day)} ${monthNames[parseInt(m) - 1]} ${y}`;
}

onMounted(async () => {
  try {
    logbook.value = await getLogbook();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

// Inline icon components
const IconList = { render: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" }, [h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" })]) };
const IconCalendar = { render: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" }, [h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" })]) };
const IconImage = { render: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" }, [h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" })]) };
const IconUser = { render: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" }, [h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" })]) };
</script>
