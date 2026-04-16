<template>
  <div class="flex min-h-screen bg-[#0f172a]">
    <!-- Sidebar Desktop -->
    <aside class="hidden lg:flex flex-col w-64 bg-[#1e293b] border-r border-[#334155] fixed h-full z-30">
      <div class="p-6 border-b border-[#334155]">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 class="text-[15px] font-bold text-slate-100 leading-tight">Worklog</h1>
            <p class="text-[11px] text-slate-500 font-mono">v1.1</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
          :class="[
            $route.path === item.to
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          ]"
        >
          <component :is="item.icon" class="w-4.5 h-4.5 shrink-0" />
          {{ item.label }}
        </router-link>
      </nav>

      <div class="p-4 border-t border-[#334155]">
        <p class="text-[11px] text-slate-600 font-mono text-center">Logbook & Task App</p>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 lg:ml-64 flex flex-col min-h-screen">
      <!-- Mobile Top Bar -->
      <header class="lg:hidden flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-[#334155] sticky top-0 z-20">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="font-bold text-slate-100 text-sm">Worklog</span>
        </div>
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition"
        >
          <svg v-if="!mobileMenuOpen" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </header>

      <!-- Mobile Menu Drawer -->
      <transition name="fade">
        <div v-if="mobileMenuOpen" class="lg:hidden fixed inset-0 z-40 flex" @click.self="mobileMenuOpen = false">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="mobileMenuOpen = false"></div>
          <div class="relative bg-[#1e293b] w-64 h-full flex flex-col z-50 shadow-2xl">
            <div class="p-5 border-b border-[#334155]">
              <p class="text-xs text-slate-500 font-mono uppercase tracking-widest">Menu</p>
            </div>
            <nav class="flex-1 p-4 space-y-1">
              <router-link
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                @click="mobileMenuOpen = false"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                :class="[
                  $route.path === item.to
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                ]"
              >
                <component :is="item.icon" class="w-4.5 h-4.5 shrink-0" />
                {{ item.label }}
              </router-link>
            </nav>
          </div>
        </div>
      </transition>

      <!-- Page Content -->
      <main class="flex-1 p-4 lg:p-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, h } from "vue";

const mobileMenuOpen = ref(false);

const IconHome = {
  render: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" }, [
    h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }),
  ]),
};

const IconBook = {
  render: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" }, [
    h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" }),
  ]),
};

const IconTask = {
  render: () => h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" }, [
    h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" }),
  ]),
};

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: IconHome },
  { to: "/logbook",   label: "Logbook",   icon: IconBook },
  { to: "/task",      label: "Task",      icon: IconTask },
];
</script>