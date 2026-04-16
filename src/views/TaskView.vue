<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-100">Task</h2>
        <p class="text-sm text-slate-500 mt-0.5">Kelola tugas dan tandai selesai dengan bukti foto</p>
      </div>
      <button
        @click="openCreate"
        class="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-lg shadow-violet-500/20 shrink-0"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Task
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Cari task…"
          class="w-full bg-[#0f172a] border border-[#334155] text-slate-300 text-sm rounded-xl pl-9 pr-4 py-2 outline-none focus:border-violet-500 transition placeholder:text-slate-600"
        />
      </div>
      <select
        v-model="filterStatus"
        class="bg-[#0f172a] border border-[#334155] text-slate-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-violet-500 transition cursor-pointer"
      >
        <option value="">Semua Status</option>
        <option value="pending">Pending</option>
        <option value="selesai">Selesai</option>
        <option value="dibatalkan">Dibatalkan</option>
      </select>
      <select
        v-model="filterAssigner"
        class="bg-[#0f172a] border border-[#334155] text-slate-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-violet-500 transition cursor-pointer"
      >
        <option value="">Semua Pemberi</option>
        <option v-for="a in assigners" :key="a.id" :value="a.nama">{{ a.nama }}</option>
      </select>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 text-center">
        <p class="text-2xl font-bold text-amber-400">{{ stats.pending }}</p>
        <p class="text-xs text-slate-500 mt-1">Pending</p>
      </div>
      <div class="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 text-center">
        <p class="text-2xl font-bold text-emerald-400">{{ stats.selesai }}</p>
        <p class="text-xs text-slate-500 mt-1">Selesai</p>
      </div>
      <div class="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 text-center">
        <p class="text-2xl font-bold text-slate-400">{{ stats.dibatalkan }}</p>
        <p class="text-xs text-slate-500 mt-1">Dibatalkan</p>
      </div>
    </div>

    <!-- Counter -->
    <div class="flex items-center justify-between">
      <p class="text-xs text-slate-500 font-mono">
        Menampilkan <span class="text-violet-400 font-bold">{{ filteredTasks.length }}</span> task
      </p>
      <button v-if="filterStatus || filterAssigner || search" @click="resetFilter" class="text-xs text-slate-500 hover:text-slate-300 transition underline">
        Reset filter
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
      <div class="w-9 h-9 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
      <p class="text-sm text-slate-500">Memuat task…</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredTasks.length === 0" class="bg-[#1e293b] border border-[#334155] rounded-2xl p-14 text-center">
      <div class="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <p class="text-slate-400 font-medium text-sm">Tidak ada task ditemukan</p>
      <p class="text-slate-600 text-xs mt-1">Tambah task baru atau ubah filter</p>
    </div>

    <!-- Desktop Table -->
    <div v-else class="hidden md:block bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-[#334155] bg-[#0f172a]/40">
            <th class="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide w-8">#</th>
            <th class="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide">Nama Task</th>
            <th class="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide">Deadline</th>
            <th class="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide">Pemberi Tugas</th>
            <th class="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide">Status</th>
            <th class="text-right text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wide">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, i) in filteredTasks"
            :key="item.id"
            class="border-b border-[#334155]/40 hover:bg-white/[0.02] transition-colors group"
            :class="{ 'opacity-60': item.is_selesai === 'TRUE' || item.status === 'dibatalkan' }"
          >
            <td class="px-5 py-3.5 text-slate-600 font-mono text-xs">{{ i + 1 }}</td>
            <td class="px-5 py-3.5 text-slate-200 font-medium max-w-[220px]">
              <span class="line-clamp-1" :class="{ 'line-through text-slate-500': item.status === 'dibatalkan' }">{{ item.nama_task }}</span>
              <p v-if="item.catatan" class="text-xs text-slate-600 truncate mt-0.5">{{ item.catatan }}</p>
            </td>
            <td class="px-5 py-3.5 whitespace-nowrap">
              <span
                class="font-mono text-xs px-2 py-1 rounded-lg"
                :class="getDeadlineClass(item.deadline, item.is_selesai)"
              >{{ formatDate(item.deadline) }}</span>
            </td>
            <td class="px-5 py-3.5">
              <span class="inline-flex items-center bg-violet-500/10 text-violet-400 text-xs px-2.5 py-1 rounded-full border border-violet-500/20">
                {{ item.pemberi_tugas }}
              </span>
            </td>
            <td class="px-5 py-3.5">
              <StatusBadge :status="item.status" :is_selesai="item.is_selesai" />
            </td>
            <td class="px-5 py-3.5 text-right">
              <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <!-- Mark Selesai -->
                <button
                  v-if="item.status === 'pending'"
                  @click="openCompleteModal(item)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
                  title="Tandai Selesai"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <!-- Batalkan -->
                <button
                  v-if="item.status === 'pending'"
                  @click="confirmCancel(item)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition"
                  title="Batalkan"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </button>
                <!-- Edit -->
                <button
                  v-if="item.status === 'pending'"
                  @click="openEdit(item)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition"
                  title="Edit"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <!-- Hapus -->
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
    <div v-if="!isMobile" class="hidden md:block">
      </div>

    <div v-else class="md:hidden space-y-3">
      <div
        v-for="item in filteredTasks"
        :key="item.id"
        class="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 space-y-3"
        :class="{ 'opacity-60': item.status !== 'pending' }"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-200 leading-snug" :class="{ 'line-through text-slate-500': item.status === 'dibatalkan' }">{{ item.nama_task }}</p>
            <p v-if="item.catatan" class="text-xs text-slate-600 mt-0.5 truncate">{{ item.catatan }}</p>
          </div>
          <StatusBadge :status="item.status" :is_selesai="item.is_selesai" />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-mono text-xs px-2 py-1 rounded-lg" :class="getDeadlineClass(item.deadline, item.is_selesai)">
            {{ formatDate(item.deadline) }}
          </span>
          <span class="inline-flex items-center bg-violet-500/10 text-violet-400 text-xs px-2.5 py-1 rounded-full border border-violet-500/20">{{ item.pemberi_tugas }}</span>
        </div>
        <div v-if="item.status === 'pending'" class="flex items-center gap-2 pt-1 border-t border-[#334155]">
          <button @click="openCompleteModal(item)" class="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl py-2 transition">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            Selesai
          </button>
          <button @click="confirmCancel(item)" class="p-2 rounded-xl text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          </button>
          <button @click="openEdit(item)" class="p-2 rounded-xl text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 transition">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button @click="confirmDelete(item)" class="p-2 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ─── CREATE / EDIT MODAL ───────────────────────────────── -->
    <transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" @click.self="closeModal">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
        <div class="modal-box relative bg-[#1e293b] border border-[#334155] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between p-5 border-b border-[#334155]">
            <h3 class="font-bold text-slate-100">{{ isEditing ? "Edit Task" : "Tambah Task" }}</h3>
            <button @click="closeModal" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="p-5 space-y-4">
            <!-- Nama Task -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400 uppercase tracking-wide">Nama Task <span class="text-red-400">*</span></label>
              <input v-model="form.nama_task" type="text" placeholder="Contoh: Rekap data mingguan…"
                class="w-full bg-[#0f172a] border border-[#334155] focus:border-violet-500 text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none transition placeholder:text-slate-600" />
            </div>

            <!-- Deadline -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400 uppercase tracking-wide">Deadline <span class="text-red-400">*</span></label>
              <input v-model="form.deadline" type="date"
                class="w-full bg-[#0f172a] border border-[#334155] focus:border-violet-500 text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none transition [color-scheme:dark]" />
            </div>

            <!-- Pemberi Tugas -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400 uppercase tracking-wide">Pemberi Tugas <span class="text-red-400">*</span></label>
              <select v-model="form.pemberi_tugas"
                class="w-full bg-[#0f172a] border border-[#334155] focus:border-violet-500 text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none transition cursor-pointer">
                <option value="" disabled>Pilih pemberi tugas…</option>
                <option v-for="a in assigners" :key="a.id" :value="a.nama">{{ a.nama }}</option>
              </select>
            </div>

            <!-- Catatan -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400 uppercase tracking-wide">Catatan (opsional)</label>
              <textarea v-model="form.catatan" rows="2" placeholder="Deskripsi atau catatan tambahan…"
                class="w-full bg-[#0f172a] border border-[#334155] focus:border-violet-500 text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none transition placeholder:text-slate-600 resize-none"></textarea>
            </div>

            <p v-if="formError" class="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{{ formError }}</p>
          </div>

          <div class="flex items-center justify-end gap-2 p-5 border-t border-[#334155]">
            <button @click="closeModal" class="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition">Batal</button>
            <button @click="submitForm" :disabled="submitting"
              class="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
              <div v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              {{ submitting ? "Menyimpan…" : (isEditing ? "Simpan Perubahan" : "Tambah") }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ─── COMPLETE MODAL (Upload foto) ──────────────────────── -->
    <transition name="modal">
      <div v-if="showCompleteModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeCompleteModal"></div>
        <div class="modal-box relative bg-[#1e293b] border border-[#334155] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between p-5 border-b border-[#334155]">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-slate-100">Tandai Selesai</h3>
                <p class="text-xs text-slate-500">Upload foto sebagai bukti penyelesaian</p>
              </div>
            </div>
            <button @click="closeCompleteModal" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="p-5 space-y-4">
            <!-- Task info -->
            <div class="bg-[#0f172a] border border-[#334155] rounded-xl p-3">
              <p class="text-sm text-slate-200 font-medium">{{ completeTarget?.nama_task }}</p>
              <p class="text-xs text-slate-500 mt-1">Deadline: {{ formatDate(completeTarget?.deadline) }}</p>
            </div>

            <!-- Tanggal Selesai -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400 uppercase tracking-wide">Tanggal Selesai <span class="text-red-400">*</span></label>
              <input v-model="completeForm.tanggal_selesai" type="date"
                class="w-full bg-[#0f172a] border border-[#334155] focus:border-emerald-500 text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none transition [color-scheme:dark]" />
            </div>

            <!-- Upload Foto -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400 uppercase tracking-wide">Foto Bukti <span class="text-red-400">*</span></label>
              <div v-if="completeFile" class="flex items-center gap-3 bg-[#0f172a] border border-[#334155] rounded-xl p-3">
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                  <img :src="completeFilePreview" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-slate-300 truncate">{{ completeFile.name }}</p>
                  <p class="text-xs text-slate-600">{{ (completeFile.size / 1024).toFixed(0) }} KB</p>
                </div>
                <button @click="clearCompleteFile" class="text-slate-600 hover:text-slate-400 transition">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div v-else @click="$refs.completeFileInput.click()" @dragover.prevent @drop.prevent="handleCompleteDrop"
                class="border-2 border-dashed border-[#334155] hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer transition group">
                <svg class="w-8 h-8 text-slate-600 group-hover:text-emerald-500/60 mx-auto mb-2 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-xs text-slate-500">Klik atau drag foto ke sini</p>
                <p class="text-xs text-slate-700 mt-1">JPG, PNG, WEBP — maks 5MB</p>
              </div>
              <input ref="completeFileInput" type="file" accept="image/*" class="hidden" @change="handleCompleteFileChange" />
            </div>

            <p v-if="completeError" class="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{{ completeError }}</p>
          </div>

          <div class="flex items-center justify-end gap-2 p-5 border-t border-[#334155]">
            <button @click="closeCompleteModal" class="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition">Batal</button>
            <button @click="submitComplete" :disabled="submitting"
              class="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
              <div v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              {{ submitting ? "Menyimpan…" : "Tandai Selesai" }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ─── ADD TO LOGBOOK CONFIRM MODAL ─────────────────────── -->
    <transition name="modal">
      <div v-if="showLogbookModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="modal-box relative bg-[#1e293b] border border-[#334155] w-full max-w-sm rounded-2xl shadow-2xl z-10 p-6">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-slate-100">Tambah ke Logbook?</h3>
              <p class="text-sm text-slate-500 mt-0.5">Task ini akan dicatat di logbook kamu.</p>
            </div>
          </div>
          <div class="bg-[#0f172a] border border-[#334155] rounded-xl p-3 mb-5">
            <p class="text-sm text-slate-300 font-medium">{{ logbookTarget?.nama_task }}</p>
            <p class="text-xs text-slate-500 mt-1">Tanggal: {{ formatDate(logbookTarget?.tanggal_selesai) }} · {{ logbookTarget?.pemberi_tugas }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="skipLogbook" class="flex-1 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition border border-[#334155]">
              Lewati
            </button>
            <button @click="addToLogbook" :disabled="submitting"
              class="flex-1 inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
              <div v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              Tambah
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ─── CANCEL CONFIRM MODAL ──────────────────────────────── -->
    <transition name="modal">
      <div v-if="showCancelModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showCancelModal = false"></div>
        <div class="modal-box relative bg-[#1e293b] border border-[#334155] w-full max-w-sm rounded-2xl shadow-2xl z-10 p-6">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-slate-100">Batalkan Task?</h3>
              <p class="text-sm text-slate-500 mt-0.5">Task akan ditandai sebagai dibatalkan.</p>
            </div>
          </div>
          <div class="bg-[#0f172a] border border-[#334155] rounded-xl p-3 mb-5">
            <p class="text-sm text-slate-300 font-medium line-clamp-2">{{ cancelTarget?.nama_task }}</p>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button @click="showCancelModal = false" class="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition">Kembali</button>
            <button @click="executeCancel" :disabled="submitting"
              class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
              <div v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {{ submitting ? "Memproses…" : "Ya, Batalkan" }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ─── DELETE CONFIRM MODAL ──────────────────────────────── -->
    <transition name="modal">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showDeleteModal = false"></div>
        <div class="modal-box relative bg-[#1e293b] border border-[#334155] w-full max-w-sm rounded-2xl shadow-2xl z-10 p-6">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-slate-100">Hapus Task?</h3>
              <p class="text-sm text-slate-500 mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          </div>
          <div class="bg-[#0f172a] border border-[#334155] rounded-xl p-3 mb-5">
            <p class="text-sm text-slate-300 font-medium line-clamp-2">{{ deleteTarget?.nama_task }}</p>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button @click="showDeleteModal = false" class="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition">Batal</button>
            <button @click="executeDelete" :disabled="submitting"
              class="inline-flex items-center gap-2 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
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
        <svg v-if="toast.type === 'success'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from "vue";
import { useApi } from "../composables/useApi.js";

// StatusBadge inline component
const StatusBadge = {
  props: ["status", "is_selesai"],
  render() {
    const s = this.status;
    const cfg = {
      pending:     { cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",   label: "Pending" },
      selesai:     { cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Selesai" },
      dibatalkan:  { cls: "bg-slate-500/10 text-slate-500 border-slate-500/20",   label: "Dibatalkan" },
    };
    const { cls, label } = cfg[s] || cfg.pending;
    return h("span", { class: `inline-flex items-center text-xs px-2.5 py-1 rounded-full border ${cls}` }, label);
  }
};

const {
  getAssigners,
  getTask, createTask, updateTask, deleteTask,
  uploadFileAndCompleteTask,
  createLogbook, uploadFileAndCreate
} = useApi();

// ── State ──
const tasks = ref([]);
const assigners = ref([]);
const loading = ref(true);

const search = ref("");
const filterStatus = ref("");
const filterAssigner = ref("");

const showModal = ref(false);
const isEditing = ref(false);
const submitting = ref(false);
const formError = ref("");
const form = ref({ id: "", nama_task: "", deadline: "", pemberi_tugas: "", catatan: "" });

const showCompleteModal = ref(false);
const completeTarget = ref(null);
const completeFile = ref(null);
const completeFilePreview = ref("");
const completeError = ref("");
const completeForm = ref({ tanggal_selesai: "" });

const showLogbookModal = ref(false);
const logbookTarget = ref(null);

const showCancelModal = ref(false);
const cancelTarget = ref(null);

const showDeleteModal = ref(false);
const deleteTarget = ref(null);

const toast = ref({ show: false, message: "", type: "success" });

// ── Computed ──
const filteredTasks = computed(() => {
  return tasks.value.filter(item => {
    const matchSearch = !search.value ||
      item.nama_task?.toLowerCase().includes(search.value.toLowerCase()) ||
      item.pemberi_tugas?.toLowerCase().includes(search.value.toLowerCase());
    const matchStatus = !filterStatus.value || item.status === filterStatus.value;
    const matchAssigner = !filterAssigner.value || item.pemberi_tugas === filterAssigner.value;
    return matchSearch && matchStatus && matchAssigner;
  });
});

const stats = computed(() => ({
  pending:    tasks.value.filter(t => t.status === "pending").length,
  selesai:    tasks.value.filter(t => t.status === "selesai").length,
  dibatalkan: tasks.value.filter(t => t.status === "dibatalkan").length,
}));

// ── Helpers ──
function formatDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const mn = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return `${parseInt(day)} ${mn[parseInt(m) - 1]} ${y}`;
}

function getDeadlineClass(deadline, is_selesai) {
  if (is_selesai === "TRUE") return "bg-emerald-500/10 text-emerald-400";
  if (!deadline) return "bg-slate-700 text-slate-400";
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(deadline);
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return "bg-red-500/10 text-red-400";
  if (diff <= 2) return "bg-amber-500/10 text-amber-400";
  return "bg-slate-700/50 text-slate-400";
}

function resetFilter() {
  search.value = "";
  filterStatus.value = "";
  filterAssigner.value = "";
}

function showToast(message, type = "success") {
  toast.value = { show: true, message, type };
  setTimeout(() => (toast.value.show = false), 3500);
}

// ── Create / Edit Task ──
function openCreate() {
  isEditing.value = false;
  form.value = { id: "", nama_task: "", deadline: new Date().toISOString().split("T")[0], pemberi_tugas: "", catatan: "" };
  formError.value = "";
  showModal.value = true;
}

function openEdit(item) {
  isEditing.value = true;
  form.value = { ...item };
  formError.value = "";
  showModal.value = true;
}

function closeModal() { showModal.value = false; formError.value = ""; }

async function submitForm() {
  formError.value = "";
  if (!form.value.nama_task.trim()) { formError.value = "Nama task wajib diisi"; return; }
  if (!form.value.deadline) { formError.value = "Deadline wajib diisi"; return; }
  if (!form.value.pemberi_tugas) { formError.value = "Pemberi tugas wajib dipilih"; return; }

  submitting.value = true;
  try {
    if (isEditing.value) {
      await updateTask(form.value);
      const idx = tasks.value.findIndex(t => t.id === form.value.id);
      if (idx !== -1) tasks.value[idx] = { ...tasks.value[idx], ...form.value };
      showToast("Task berhasil diperbarui");
    } else {
      const result = await createTask({ ...form.value, status: "pending", is_selesai: "FALSE" });
      tasks.value.unshift({ ...form.value, id: result.id, status: "pending", is_selesai: "FALSE" });
      showToast("Task berhasil ditambahkan");
    }
    closeModal();
  } catch (e) {
    formError.value = e.message || "Terjadi kesalahan, coba lagi";
  } finally {
    submitting.value = false;
  }
}

// ── Complete Task ──
function openCompleteModal(item) {
  completeTarget.value = item;
  completeFile.value = null;
  completeFilePreview.value = "";
  completeError.value = "";
  completeForm.value = { tanggal_selesai: new Date().toISOString().split("T")[0] };
  showCompleteModal.value = true;
}

function closeCompleteModal() { showCompleteModal.value = false; }

function handleCompleteFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { completeError.value = "Ukuran file maksimal 5MB"; return; }
  completeFile.value = file;
  completeFilePreview.value = URL.createObjectURL(file);
  completeError.value = "";
}

function handleCompleteDrop(e) {
  const file = e.dataTransfer.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { completeError.value = "Hanya file gambar yang diizinkan"; return; }
  if (file.size > 5 * 1024 * 1024) { completeError.value = "Ukuran file maksimal 5MB"; return; }
  completeFile.value = file;
  completeFilePreview.value = URL.createObjectURL(file);
  completeError.value = "";
}

function clearCompleteFile() { completeFile.value = null; completeFilePreview.value = ""; }

async function submitComplete() {
  completeError.value = "";
  if (!completeFile.value) { completeError.value = "Foto bukti wajib diupload"; return; }
  if (!completeForm.value.tanggal_selesai) { completeError.value = "Tanggal selesai wajib diisi"; return; }

  submitting.value = true;
  try {
    const updateData = {
      ...completeTarget.value,
      status: "selesai",
      is_selesai: "TRUE",
      tanggal_selesai: completeForm.value.tanggal_selesai,
    };
    const result = await uploadFileAndCompleteTask(completeFile.value, updateData);
    updateData.dokumentasi_url = result.dokumentasi_url;

    const idx = tasks.value.findIndex(t => t.id === completeTarget.value.id);
    if (idx !== -1) tasks.value[idx] = { ...tasks.value[idx], ...updateData };

    closeCompleteModal();
    showToast("Task ditandai selesai! 🎉");

    // Tanya mau tambah ke logbook
    setTimeout(() => {
      logbookTarget.value = { ...updateData };
      showLogbookModal.value = true;
    }, 400);
  } catch (e) {
    completeError.value = e.message || "Terjadi kesalahan, coba lagi";
  } finally {
    submitting.value = false;
  }
}

// ── Add to Logbook ──
function skipLogbook() { showLogbookModal.value = false; logbookTarget.value = null; }

async function addToLogbook() {
  submitting.value = true;
  try {
    const logData = {
      nama_kegiatan: logbookTarget.value.nama_task,
      tanggal: logbookTarget.value.tanggal_selesai,
      pemberi_tugas: logbookTarget.value.pemberi_tugas,
      dokumentasi_url: logbookTarget.value.dokumentasi_url || "",
    };
    await createLogbook(logData);
    showLogbookModal.value = false;
    logbookTarget.value = null;
    showToast("Berhasil ditambahkan ke Logbook! 📖");
  } catch (e) {
    showToast(e.message || "Gagal menambah ke logbook", "error");
  } finally {
    submitting.value = false;
  }
}

// ── Cancel Task ──
function confirmCancel(item) { cancelTarget.value = item; showCancelModal.value = true; }

async function executeCancel() {
  submitting.value = true;
  try {
    await updateTask({ ...cancelTarget.value, status: "dibatalkan" });
    const idx = tasks.value.findIndex(t => t.id === cancelTarget.value.id);
    if (idx !== -1) tasks.value[idx] = { ...tasks.value[idx], status: "dibatalkan" };
    showCancelModal.value = false;
    showToast("Task dibatalkan");
  } catch (e) {
    showToast(e.message || "Gagal membatalkan task", "error");
  } finally {
    submitting.value = false;
  }
}

// ── Delete Task ──
function confirmDelete(item) { deleteTarget.value = item; showDeleteModal.value = true; }

async function executeDelete() {
  submitting.value = true;
  try {
    await deleteTask(deleteTarget.value.id);
    tasks.value = tasks.value.filter(t => t.id !== deleteTarget.value.id);
    showDeleteModal.value = false;
    showToast("Task berhasil dihapus");
  } catch (e) {
    showToast(e.message || "Gagal menghapus", "error");
  } finally {
    submitting.value = false;
  }
}

// ── Lifecycle ──
onMounted(async () => {
  try {
    [tasks.value, assigners.value] = await Promise.all([getTask(), getAssigners()]);
  } catch (e) {
    showToast("Gagal memuat data: " + e.message, "error");
  } finally {
    loading.value = false;
  }
});
</script>