<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-100">Logbook</h2>
        <p class="text-sm text-slate-500 mt-0.5">Kelola catatan kegiatan harian kamu</p>
      </div>
      <button
        @click="openCreate"
        class="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-lg shadow-sky-500/20 shrink-0"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Kegiatan
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
      <!-- Search -->
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Cari kegiatan…"
          class="w-full bg-[#0f172a] border border-[#334155] text-slate-300 text-sm rounded-xl pl-9 pr-4 py-2 outline-none focus:border-sky-500 transition placeholder:text-slate-600"
        />
      </div>
      <!-- Month Filter -->
      <select
        v-model="selectedMonth"
        class="bg-[#0f172a] border border-[#334155] text-slate-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-sky-500 transition cursor-pointer"
      >
        <option value="">Semua Bulan</option>
        <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>
      <!-- Year Filter -->
      <select
        v-model="selectedYear"
        class="bg-[#0f172a] border border-[#334155] text-slate-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-sky-500 transition cursor-pointer"
      >
        <option value="">Semua Tahun</option>
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
      <!-- Sort by Date -->
      <button
        @click="toggleSort"
        class="inline-flex items-center gap-2 bg-[#0f172a] border border-[#334155] hover:border-sky-500/50 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none transition cursor-pointer shrink-0"
        :title="sortOrder === 'desc' ? 'Terbaru dulu' : 'Terlama dulu'"
      >
        <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="hidden sm:inline">{{ sortOrder === 'desc' ? 'Terbaru' : 'Terlama' }}</span>
        <svg
          class="w-3.5 h-3.5 text-sky-400 transition-transform duration-200"
          :class="sortOrder === 'asc' ? 'rotate-180' : ''"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <!-- Counter -->
    <div class="flex items-center justify-between">
      <p class="text-xs text-slate-500 font-mono">
        Menampilkan <span class="text-sky-400 font-bold">{{ paginatedLogbook.length }}</span>
        dari <span class="text-sky-400 font-bold">{{ filteredLogbook.length }}</span> kegiatan
      </p>
      <button v-if="selectedMonth || selectedYear || search" @click="resetFilter" class="text-xs text-slate-500 hover:text-slate-300 transition underline">
        Reset filter
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
      <div class="w-9 h-9 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>
      <p class="text-sm text-slate-500">Memuat logbook…</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredLogbook.length === 0" class="bg-[#1e293b] border border-[#334155] rounded-2xl p-14 text-center">
      <div class="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-slate-400 font-medium text-sm">Tidak ada kegiatan ditemukan</p>
      <p class="text-slate-600 text-xs mt-1">Coba ubah filter atau tambah kegiatan baru</p>
    </div>

    <!-- Desktop Table -->
    <div v-else class="hidden md:block bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-[#334155] bg-[#0f172a]/40">
            <th class="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide w-8">#</th>
            <th class="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide">Nama Kegiatan</th>
            <th class="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide">Volume</th>
            <th
              class="text-left text-xs font-medium px-5 py-3 uppercase tracking-wide cursor-pointer select-none group transition-colors"
              :class="'text-sky-400'"
              @click="toggleSort"
            >
              <span class="inline-flex items-center gap-1.5">
                Tanggal
                <svg
                  class="w-3 h-3 transition-transform duration-200"
                  :class="sortOrder === 'asc' ? 'rotate-180' : ''"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </th>
            <th class="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide">Pemberi Tugas</th>
            <th class="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide">Dokumentasi</th>
            <th class="text-right text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, i) in paginatedLogbook"
            :key="item.id"
            class="border-b border-[#334155]/40 hover:bg-white/[0.02] transition-colors group"
          >
            <td class="px-5 py-3.5 text-slate-600 font-mono text-xs">{{ (currentPage - 1) * perPage + i + 1 }}</td>
            <td class="px-5 py-3.5 text-slate-200 font-medium max-w-[220px]">
              <span class="line-clamp-1">{{ item.nama_kegiatan }}</span>
            </td>
            <td class="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
              <span v-if="item.volume" class="inline-flex items-center gap-1">
                <span class="text-slate-200 font-mono font-medium">{{ item.volume }}</span>
                <span class="text-slate-500">{{ item.satuan }}</span>
              </span>
              <span v-else class="text-slate-700">—</span>
            </td>
            <td class="px-5 py-3.5 text-slate-400 font-mono text-xs whitespace-nowrap">{{ formatDate(item.tanggal) }}</td>
            <td class="px-5 py-3.5">
              <span class="inline-flex items-center bg-sky-500/10 text-sky-400 text-xs px-2.5 py-1 rounded-full border border-sky-500/20">
                {{ item.pemberi_tugas }}
              </span>
            </td>
            <td class="px-5 py-3.5">
              <a
                v-if="item.dokumentasi_url"
                :href="item.dokumentasi_url"
                target="_blank"
                class="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition font-medium"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Lihat
              </a>
              <span v-else class="text-slate-700 text-xs">—</span>
            </td>
            <td class="px-5 py-3.5 text-right">
              <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="openEdit(item)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition"
                  title="Edit"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="confirmDelete(item)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Hapus"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div v-if="filteredLogbook.length === 0">
      <p>Data tidak ditemukan...</p>
    </div>

    <div v-else class="md:hidden space-y-3">
      <div
        v-for="item in paginatedLogbook"
        :key="item.id"
        class="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 space-y-3"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm font-semibold text-slate-200 leading-snug">{{ item.nama_kegiatan }}</p>
          <div class="flex items-center gap-1 shrink-0">
            <button @click="openEdit(item)" class="p-1.5 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="confirmDelete(item)" class="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-mono text-slate-500 bg-[#0f172a] px-2 py-1 rounded-lg">{{ formatDate(item.tanggal) }}</span>
          <span v-if="item.volume" class="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-1 rounded-full">
            {{ item.volume }} {{ item.satuan }}
          </span>
          <span class="inline-flex items-center bg-sky-500/10 text-sky-400 text-xs px-2.5 py-1 rounded-full border border-sky-500/20">{{ item.pemberi_tugas }}</span>
          <a v-if="item.dokumentasi_url" :href="item.dokumentasi_url" target="_blank"
            class="inline-flex items-center gap-1 bg-orange-500/10 text-orange-400 text-xs px-2.5 py-1 rounded-full border border-orange-500/20">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Foto
          </a>
        </div>
      </div>
    </div>

    <!-- ─── PAGINATION ─────────────────────────────────────────── -->
    <div v-if="totalPages > 1" class="flex items-center justify-between gap-3 pt-1">
      <!-- Info -->
      <p class="text-xs text-slate-600 font-mono hidden sm:block">
        Hal {{ currentPage }} / {{ totalPages }}
      </p>

      <!-- Controls -->
      <div class="flex items-center gap-1 mx-auto sm:mx-0">
        <!-- First -->
        <button
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          class="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Halaman pertama"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <!-- Prev -->
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Sebelumnya"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Page numbers -->
        <template v-for="page in visiblePages" :key="page">
          <span v-if="page === '...'" class="px-1 text-xs text-slate-600">…</span>
          <button
            v-else
            @click="goToPage(page)"
            class="w-8 h-8 rounded-lg text-xs font-medium transition"
            :class="page === currentPage
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'"
          >
            {{ page }}
          </button>
        </template>

        <!-- Next -->
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Berikutnya"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <!-- Last -->
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Halaman terakhir"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Per-page selector -->
      <select
        v-model="perPage"
        @change="goToPage(1)"
        class="bg-[#0f172a] border border-[#334155] text-slate-400 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-sky-500 transition cursor-pointer hidden sm:block"
      >
        <option :value="10">10 / hal</option>
        <option :value="25">25 / hal</option>
        <option :value="50">50 / hal</option>
      </select>
    </div>

    <!-- ─── CREATE / EDIT MODAL ───────────────────────────────── -->
    <transition name="modal">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        @click.self="closeModal"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>

        <div class="modal-box relative bg-[#1e293b] border border-[#334155] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-[#334155]">
            <h3 class="font-bold text-slate-100">
              {{ isEditing ? "Edit Kegiatan" : "Tambah Kegiatan" }}
            </h3>
            <button @click="closeModal" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <div class="p-5 space-y-4">
            <!-- Nama Kegiatan -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400 uppercase tracking-wide">Nama Kegiatan <span class="text-red-400">*</span></label>
              <input
                v-model="form.nama_kegiatan"
                type="text"
                placeholder="Contoh: Rapat koordinasi tim…"
                class="w-full bg-[#0f172a] border border-[#334155] focus:border-sky-500 text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none transition placeholder:text-slate-600"
              />
            </div>

            <!-- Tanggal -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400 uppercase tracking-wide">Tanggal <span class="text-red-400">*</span></label>
              <input
                v-model="form.tanggal"
                type="date"
                class="w-full bg-[#0f172a] border border-[#334155] focus:border-sky-500 text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none transition [color-scheme:dark]"
              />
            </div>

            <!-- Pemberi Tugas -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400 uppercase tracking-wide">Pemberi Tugas <span class="text-red-400">*</span></label>
              <select
                v-model="form.pemberi_tugas"
                class="w-full bg-[#0f172a] border border-[#334155] focus:border-sky-500 text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none transition cursor-pointer"
              >
                <option value="" disabled>Pilih pemberi tugas…</option>
                <option v-for="a in assigners" :key="a.id" :value="a.nama">{{ a.nama }}</option>
              </select>
              <p v-if="assignersLoading" class="text-xs text-slate-600">Memuat daftar pemberi tugas…</p>
            </div>

            <!-- Volume & Satuan -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-slate-400 uppercase tracking-wide">Volume</label>
                <input
                  v-model="form.volume"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Contoh: 10"
                  class="w-full bg-[#0f172a] border border-[#334155] focus:border-sky-500 text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none transition placeholder:text-slate-600"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-slate-400 uppercase tracking-wide">Satuan</label>
                <select
                  v-model="form.satuan"
                  @change="onSatuanChange(form.satuan)"
                  class="w-full bg-[#0f172a] border border-[#334155] focus:border-sky-500 text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none transition cursor-pointer"
                >
                  <option value="">Pilih satuan…</option>
                  <option v-for="s in satuanList" :key="s.nama" :value="s.nama">{{ s.nama }}</option>
                  <option value="__add_new__" class="text-sky-400">+ Tambah satuan lain…</option>
                </select>
              </div>
            </div>

            <!-- Tambah Satuan Baru -->
            <div v-if="showAddSatuan" class="bg-[#0f172a] border border-sky-500/30 rounded-xl p-3 space-y-2">
              <p class="text-xs text-sky-400 font-medium">Tambah satuan baru</p>
              <div class="flex gap-2">
                <input
                  v-model="newSatuanName"
                  type="text"
                  placeholder="Nama satuan…"
                  @keyup.enter="addSatuan"
                  class="flex-1 bg-[#1e293b] border border-[#334155] focus:border-sky-500 text-slate-200 text-sm rounded-xl px-3 py-2 outline-none transition placeholder:text-slate-600"
                />
                <button
                  @click="addSatuan"
                  :disabled="addSatuanLoading"
                  class="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-sm font-semibold px-3 py-2 rounded-xl transition"
                >
                  <div v-if="addSatuanLoading" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah
                </button>
                <button
                  @click="showAddSatuan = false; newSatuanName = ''; addSatuanError = ''"
                  class="px-3 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-xl transition"
                >
                  Batal
                </button>
              </div>
              <p v-if="addSatuanError" class="text-xs text-red-400">{{ addSatuanError }}</p>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400 uppercase tracking-wide">Dokumentasi (Foto)</label>

              <!-- Preview existing -->
              <div v-if="form.dokumentasi_url && !newFile" class="flex items-center gap-3 bg-[#0f172a] border border-[#334155] rounded-xl p-3">
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                  <img :src="form.dokumentasi_url.replace('/view', '/preview')" class="w-full h-full object-cover" @error="imgError = true" />
                </div>
                <div class="flex-1 min-w-0">
                  <a :href="form.dokumentasi_url" target="_blank" class="text-xs text-orange-400 hover:text-orange-300 truncate block transition">Lihat dokumentasi lama</a>
                </div>
                <button @click="form.dokumentasi_url = ''" class="text-slate-600 hover:text-slate-400 transition">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Preview new file -->
              <div v-if="newFile" class="flex items-center gap-3 bg-[#0f172a] border border-[#334155] rounded-xl p-3">
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                  <img :src="newFilePreview" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-slate-300 truncate">{{ newFile.name }}</p>
                  <p class="text-xs text-slate-600">{{ (newFile.size / 1024).toFixed(0) }} KB</p>
                </div>
                <button @click="clearFile" class="text-slate-600 hover:text-slate-400 transition">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Dropzone -->
              <div
                v-if="!newFile && !form.dokumentasi_url"
                @click="$refs.fileInput.click()"
                @dragover.prevent
                @drop.prevent="handleDrop"
                class="border-2 border-dashed border-[#334155] hover:border-sky-500/50 rounded-xl p-6 text-center cursor-pointer transition group"
              >
                <svg class="w-8 h-8 text-slate-600 group-hover:text-sky-500/60 mx-auto mb-2 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-xs text-slate-500">Klik atau drag foto ke sini</p>
                <p class="text-xs text-slate-700 mt-1">JPG, PNG, WEBP — maks 5MB</p>
              </div>
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
            </div>

            <!-- Error -->
            <p v-if="formError" class="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{{ formError }}</p>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-2 p-5 border-t border-[#334155]">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition"
            >
              Batal
            </button>
            <button
              @click="submitForm"
              :disabled="submitting"
              class="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-xl transition"
            >
              <div v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ submitting ? "Menyimpan…" : (isEditing ? "Simpan Perubahan" : "Tambah") }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ─── DELETE CONFIRM MODAL ──────────────────────────────── -->
    <transition name="modal">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="showDeleteModal = false"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showDeleteModal = false"></div>
        <div class="modal-box relative bg-[#1e293b] border border-[#334155] w-full max-w-sm rounded-2xl shadow-2xl z-10 p-6">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-slate-100">Hapus Kegiatan?</h3>
              <p class="text-sm text-slate-500 mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          </div>
          <div class="bg-[#0f172a] border border-[#334155] rounded-xl p-3 mb-5">
            <p class="text-sm text-slate-300 font-medium line-clamp-2">{{ deleteTarget?.nama_kegiatan }}</p>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button @click="showDeleteModal = false" class="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition">
              Batal
            </button>
            <button
              @click="executeDelete"
              :disabled="submitting"
              class="inline-flex items-center gap-2 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition"
            >
              <div v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {{ submitting ? "Menghapus…" : "Hapus" }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="fade">
      <div
        v-if="toast.show"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium border"
        :class="[
          toast.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/15 border-red-500/30 text-red-400'
        ]"
      >
        <svg v-if="toast.type === 'success'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useApi } from "../composables/useApi.js";

const { getLogbook, getAssigners, getSatuan, createSatuan, createLogbook, updateLogbook, deleteLogbook, uploadFileAndCreate, uploadFileAndUpdate } = useApi();

// ── State ──
const logbook = ref([]);
const assigners = ref([]);
const satuanList = ref([]);
const loading = ref(true);
const assignersLoading = ref(true);

const search = ref("");
const selectedMonth = ref("");
const selectedYear = ref("");
const sortOrder = ref("desc"); // 'desc' = terbaru dulu, 'asc' = terlama dulu

// Pagination
const currentPage = ref(1);
const perPage = ref(10);

const showModal = ref(false);
const isEditing = ref(false);
const showDeleteModal = ref(false);
const deleteTarget = ref(null);
const submitting = ref(false);
const formError = ref("");

const showAddSatuan = ref(false);
const newSatuanName = ref("");
const addSatuanLoading = ref(false);
const addSatuanError = ref("");

const newFile = ref(null);
const newFilePreview = ref("");
const fileInput = ref(null);

const toast = ref({ show: false, message: "", type: "success" });

const form = ref({
  id: "",
  nama_kegiatan: "",
  tanggal: "",
  pemberi_tugas: "",
  volume: "",
  satuan: "",
  dokumentasi_url: "",
});

// ── Computed ──
const months = [
  { value: "01", label: "Januari" }, { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },   { value: "04", label: "April" },
  { value: "05", label: "Mei" },     { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },    { value: "08", label: "Agustus" },
  { value: "09", label: "September" },{ value: "10", label: "Oktober" },
  { value: "11", label: "November" },{ value: "12", label: "Desember" },
];

const years = computed(() => {
  const allYears = [...new Set(logbook.value.map((i) => i.tanggal?.split("-")[0]).filter(Boolean))];
  const cur = String(new Date().getFullYear());
  if (!allYears.includes(cur)) allYears.push(cur);
  return allYears.sort((a, b) => b - a);
});

const filteredLogbook = computed(() => {
  const result = logbook.value.filter((item) => {
    const matchSearch = !search.value || item.nama_kegiatan?.toLowerCase().includes(search.value.toLowerCase()) || item.pemberi_tugas?.toLowerCase().includes(search.value.toLowerCase());
    const [y, m] = (item.tanggal || "").split("-");
    const matchMonth = !selectedMonth.value || m === selectedMonth.value;
    const matchYear = !selectedYear.value || y === String(selectedYear.value);
    return matchSearch && matchMonth && matchYear;
  });

  // Sort by date
  result.sort((a, b) => {
    const dateA = new Date(a.tanggal || "1970-01-01");
    const dateB = new Date(b.tanggal || "1970-01-01");
    return sortOrder.value === "desc" ? dateB - dateA : dateA - dateB;
  });

  return result;
});

// Pagination computed
const totalPages = computed(() => Math.max(1, Math.ceil(filteredLogbook.value.length / perPage.value)));

const paginatedLogbook = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredLogbook.value.slice(start, start + perPage.value);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (cur <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", total);
  } else if (cur >= total - 3) {
    pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "...", cur - 1, cur, cur + 1, "...", total);
  }
  return pages;
});

// Reset ke halaman 1 saat filter berubah
watch([search, selectedMonth, selectedYear], () => { currentPage.value = 1; });

// ── Methods ──
function formatDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const monthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return `${parseInt(day)} ${monthNames[parseInt(m) - 1]} ${y}`;
}

function resetFilter() {
  search.value = "";
  selectedMonth.value = "";
  selectedYear.value = "";
  currentPage.value = 1;
}

function toggleSort() {
  sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
  currentPage.value = 1;
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openCreate() {
  isEditing.value = false;
  form.value = { id: "", nama_kegiatan: "", tanggal: new Date().toISOString().split("T")[0], pemberi_tugas: "", volume: "", satuan: "", dokumentasi_url: "" };
  newFile.value = null;
  newFilePreview.value = "";
  formError.value = "";
  showAddSatuan.value = false;
  newSatuanName.value = "";
  showModal.value = true;
}

function openEdit(item) {
  isEditing.value = true;
  form.value = { ...item };
  newFile.value = null;
  newFilePreview.value = "";
  formError.value = "";
  showAddSatuan.value = false;
  newSatuanName.value = "";
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  formError.value = "";
}

function confirmDelete(item) {
  deleteTarget.value = item;
  showDeleteModal.value = true;
}

function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { formError.value = "Ukuran file maksimal 5MB"; return; }
  newFile.value = file;
  newFilePreview.value = URL.createObjectURL(file);
}

function handleDrop(e) {
  const file = e.dataTransfer.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { formError.value = "Hanya file gambar yang diizinkan"; return; }
  if (file.size > 5 * 1024 * 1024) { formError.value = "Ukuran file maksimal 5MB"; return; }
  newFile.value = file;
  newFilePreview.value = URL.createObjectURL(file);
}

function clearFile() {
  newFile.value = null;
  newFilePreview.value = "";
  if (fileInput.value) fileInput.value.value = "";
}

async function submitForm() {
  formError.value = "";
  if (!form.value.nama_kegiatan.trim()) { formError.value = "Nama kegiatan wajib diisi"; return; }
  if (!form.value.tanggal) { formError.value = "Tanggal wajib diisi"; return; }
  if (!form.value.pemberi_tugas) { formError.value = "Pemberi tugas wajib dipilih"; return; }

  submitting.value = true;
  try {
    if (isEditing.value) {
      if (newFile.value) {
        // Result berisi {success, dokumentasi_url, thumbUrl}
        const result = await uploadFileAndUpdate(newFile.value, form.value);
        form.value.dokumentasi_url = result.dokumentasi_url; 
      } else {
        await updateLogbook(form.value);
      }
      
      // Update state lokal
      const idx = logbook.value.findIndex((i) => i.id === form.value.id);
      if (idx !== -1) {
        logbook.value[idx] = { ...form.value };
      }
      showToast("Kegiatan berhasil diperbarui", "success");
      
    } else {
      if (newFile.value) {
        // Result berisi {success, id, dokumentasi_url, thumbUrl}
        const result = await uploadFileAndCreate(newFile.value, form.value);
        logbook.value.unshift({ 
          ...form.value, 
          id: result.id, 
          dokumentasi_url: result.dokumentasi_url 
        });
      } else {
        const result = await createLogbook(form.value);
        logbook.value.unshift({ 
          ...form.value, 
          id: result.id 
        });
      }
      showToast("Kegiatan berhasil ditambahkan", "success");
    }
    closeModal();
  } catch (e) {
    console.error("submitForm error:", e);
    formError.value = e.message || "Terjadi kesalahan, coba lagi";
  } finally {
    submitting.value = false;
  }
}

async function addSatuan() {
  const nama = newSatuanName.value.trim();
  if (!nama) { addSatuanError.value = "Nama satuan tidak boleh kosong"; return; }
  if (satuanList.value.some(s => s.nama.toLowerCase() === nama.toLowerCase())) {
    addSatuanError.value = "Satuan sudah ada";
    return;
  }
  addSatuanLoading.value = true;
  addSatuanError.value = "";
  try {
    await createSatuan(nama);
    satuanList.value.push({ nama });
    form.value.satuan = nama;
    showAddSatuan.value = false;
    newSatuanName.value = "";
  } catch (e) {
    addSatuanError.value = e.message || "Gagal menambah satuan";
  } finally {
    addSatuanLoading.value = false;
  }
}

function onSatuanChange(val) {
  if (val === "__add_new__") {
    form.value.satuan = "";
    showAddSatuan.value = true;
  } else {
    showAddSatuan.value = false;
  }
}

async function executeDelete(){
  // Guard clause: pastikan ada target yang akan dihapus
  if (!deleteTarget.value) return;

  submitting.value = true;
  try {
    await deleteLogbook(deleteTarget.value.id);
    
    // Update state lokal setelah berhasil hapus di API
    logbook.value = logbook.value.filter((i) => i.id !== deleteTarget.value.id);
    
    showDeleteModal.value = false;
    showToast("Kegiatan berhasil dihapus", "success");
    
    // Reset target delete setelah selesai
    deleteTarget.value = null;
  } catch (e) {
    showToast(e.message || "Gagal menghapus", "error");
  } finally {
    submitting.value = false;
  }
}

function showToast(message, type = "success") {
  toast.value = { show: true, message, type };
  setTimeout(() => (toast.value.show = false), 3000);
}

// ── Lifecycle ──
onMounted(async () => {
  try {
    [logbook.value, assigners.value, satuanList.value] = await Promise.all([getLogbook(), getAssigners(), getSatuan()]);
    assignersLoading.value = false;
  } catch (e) {
    showToast("Gagal memuat data: " + e.message, "error");
  } finally {
    loading.value = false;
    assignersLoading.value = false;
  }
});
</script>