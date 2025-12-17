<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <div
      class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-10 text-white shadow-2xl"
    >
      <div
        class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"
      ></div>
      <div class="relative z-10">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          Welcome to IndexedDB Guide 💾
        </h1>
        <p class="text-lg md:text-xl text-blue-100 max-w-2xl">
          Learn how to leverage browser-based storage with TypeScript and the
          powerful
          <code class="bg-white/20 px-2 py-1 rounded">idb</code> library for
          offline-first applications.
        </p>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Documentation Card -->
      <router-link
        to="/docs/indexdb"
        class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700/50 hover:-translate-y-1"
      >
        <div
          class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2"
        ></div>
        <div class="relative">
          <span class="text-4xl mb-4 block">📖</span>
          <h2
            class="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
          >
            Documentation
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            Comprehensive guide on using IndexedDB with
            <code
              class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm"
              >idb</code
            >
            and TypeScript. Learn setup, CRUD operations, and best practices.
          </p>
          <span
            class="inline-flex items-center mt-4 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-2 transition-all"
          >
            Read the docs
            <svg
              class="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </span>
        </div>
      </router-link>

      <!-- Form Demo Card -->
      <router-link
        to="/demo/indexdb"
        class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700/50 hover:-translate-y-1"
      >
        <div
          class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/2"
        ></div>
        <div class="relative">
          <span class="text-4xl mb-4 block">📝</span>
          <h2
            class="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
          >
            Form Caching Demo
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            Experience auto-saving form data to IndexedDB. Your input persists
            through page reloads and browser sessions.
          </p>
          <span
            class="inline-flex items-center mt-4 text-green-600 dark:text-green-400 font-medium group-hover:gap-2 transition-all"
          >
            Try it now
            <svg
              class="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </span>
        </div>
      </router-link>

      <!-- Image Gallery Card -->
      <router-link
        to="/demo/gallery"
        class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700/50 hover:-translate-y-1 md:col-span-2"
      >
        <div
          class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2"
        ></div>
        <div class="relative">
          <span class="text-4xl mb-4 block">🖼️</span>
          <h2
            class="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
          >
            Image Gallery Cache Demo
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            Fetch images from Picsum API and cache them in IndexedDB. Images
            load instantly on revisit, even offline!
          </p>
          <span
            class="inline-flex items-center mt-4 text-amber-600 dark:text-amber-400 font-medium group-hover:gap-2 transition-all"
          >
            View Gallery
            <svg
              class="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </span>
        </div>
      </router-link>
    </div>
  </div>
</template>
