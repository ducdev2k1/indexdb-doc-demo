<script setup lang="ts">
import { onMounted, ref } from "vue";

const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  updateTheme();
};

const updateTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  // Default to dark if no preference saved
  if (savedTheme === "light") {
    isDark.value = false;
  } else {
    isDark.value = true; // Default dark
  }
  updateTheme();
});
</script>

<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
  >
    <span v-if="isDark" class="text-xl">☀️</span>
    <span v-else class="text-xl">🌙</span>
  </button>
</template>
