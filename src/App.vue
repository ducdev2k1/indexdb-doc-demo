<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import TableOfContents from "./components/TableOfContents.vue";
import ThemeToggle from "./components/ThemeToggle.vue";

const theme = computed(() => localStorage.getItem("theme") || "dark");
const route = useRoute();

// Mobile menu state
const isMobileMenuOpen = ref(false);

// Close mobile menu on route change
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
  }
);

// Check if current route is docs
const isDocsPage = computed(() => route.path.startsWith("/docs"));

// Scroll to Top Logic
const showScrollButton = ref(false);

const checkScroll = () => {
  showScrollButton.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

onMounted(() => {
  window.addEventListener("scroll", checkScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", checkScroll);
});

const navLinks = [
  { to: "/", label: "Trang chủ" },
  { to: "/docs/indexdb", label: "Tài liệu" },
  { to: "/demo/indexdb", label: "Demo Form" },
  { to: "/demo/gallery", label: "Demo Ảnh" },
  { to: "/demo/search", label: "Demo Tìm Kiếm" },
];
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 font-sans text-gray-900 dark:text-gray-100 transition-all duration-500"
  >
    <!-- Navigation -->
    <nav
      class="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/20 dark:shadow-black/20"
    >
      <div class="max-w-6xl mx-auto px-4 py-3 md:px-6 md:py-4">
        <div class="flex justify-between items-center">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-2">
            <span class="text-2xl">💾</span>
            <span
              class="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
            >
              IndexedDB Guide
            </span>
          </router-link>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-4 lg:gap-6">
            <router-link
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="relative px-2 py-2 text-sm lg:text-base font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
            >
              {{ link.label }}
              <span
                class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300"
              ></span>
            </router-link>
            <ThemeToggle />
          </div>

          <!-- Mobile Menu Button -->
          <div class="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              <!-- Hamburger Icon -->
              <svg
                v-if="!isMobileMenuOpen"
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <!-- Close Icon -->
              <svg
                v-else
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div
          v-if="isMobileMenuOpen"
          class="md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
        >
          <div class="flex flex-col gap-1">
            <router-link
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :class="{
                'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400':
                  route.path === link.to,
              }"
            >
              {{ link.label }}
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-10">
      <router-view
        class="markdown-body"
        :data-theme="theme"
        :key="route.fullPath"
      />
    </main>

    <!-- Table of Contents (only on docs pages, desktop only) -->
    <TableOfContents v-if="isDocsPage" :key="route.fullPath" />

    <!-- Footer -->
    <footer
      class="mt-auto border-t border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm"
    >
      <div
        class="max-w-6xl mx-auto px-4 py-4 md:px-6 md:py-6 text-center text-xs md:text-sm text-gray-500 dark:text-gray-400"
      >
        Xây dựng với Vue 3 + TypeScript + idb • IndexedDB Demo & Documentation
      </div>
    </footer>

    <!-- Scroll to Top Button -->
    <button
      @click="scrollToTop"
      class="fixed bottom-4 right-4 md:bottom-8 md:right-8 p-2 md:p-3 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 z-50 flex items-center justify-center opacity-0 translate-y-4"
      :class="{
        'opacity-100 translate-y-0': showScrollButton,
        'pointer-events-none': !showScrollButton,
      }"
      aria-label="Scroll to top"
    >
      <svg
        class="w-5 h-5 md:w-6 md:h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        ></path>
      </svg>
    </button>
  </div>
</template>
