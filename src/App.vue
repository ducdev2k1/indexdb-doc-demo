<script setup lang="ts">
import { computed } from "vue";
import ThemeToggle from "./components/ThemeToggle.vue";

const theme = computed(() => localStorage.getItem("theme") || "dark");
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 font-sans text-gray-900 dark:text-gray-100 transition-all duration-500"
  >
    <!-- Navigation with glassmorphism -->
    <nav
      class="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/20 dark:shadow-black/20"
    >
      <div
        class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center"
      >
        <div class="flex items-center gap-2">
          <span class="text-2xl">💾</span>
          <span
            class="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
          >
            IndexedDB Guide
          </span>
        </div>
        <div class="flex items-center gap-6">
          <router-link
            to="/"
            class="relative px-3 py-2 font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            Trang chủ
            <span
              class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300"
            ></span>
          </router-link>
          <router-link
            to="/docs/indexdb"
            class="relative px-3 py-2 font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            Tài liệu
            <span
              class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300"
            ></span>
          </router-link>
          <router-link
            to="/demo/indexdb"
            class="relative px-3 py-2 font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            Demo Form
            <span
              class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300"
            ></span>
          </router-link>
          <router-link
            to="/demo/gallery"
            class="relative px-3 py-2 font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            Demo Ảnh
            <span
              class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300"
            ></span>
          </router-link>
          <ThemeToggle />
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="max-w-6xl mx-auto px-6 py-10">
      <router-view class="markdown-body" :data-theme="theme" />
    </main>

    <!-- Footer -->
    <footer
      class="mt-auto border-t border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm"
    >
      <div
        class="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        Xây dựng với Vue 3 + TypeScript + idb • IndexedDB Demo & Documentation
      </div>
    </footer>
  </div>
</template>
