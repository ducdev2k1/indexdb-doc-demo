<template>
  <div
    class="relative group my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-[#2d2d2d] shadow-lg"
  >
    <!-- Header / Actions -->
    <div
      class="flex justify-between items-center px-4 py-3 bg-[#1f1f1f] border-b border-gray-700 select-none"
    >
      <!-- Mac-style dots -->
      <div class="flex space-x-2">
        <div class="w-3 h-3 rounded-full bg-red-400 opacity-80"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400 opacity-80"></div>
        <div class="w-3 h-3 rounded-full bg-green-400 opacity-80"></div>
      </div>

      <!-- Copy Button -->
      <button
        @click="copyCode"
        class="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-all duration-200"
      >
        <span v-if="copied" class="text-green-400">✓ Copied</span>
        <span v-else class="flex items-center gap-1">
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy
        </span>
      </button>
    </div>

    <!-- Content -->
    <div
      ref="contentRef"
      class="relative overflow-hidden transition-all duration-500 ease-in-out"
      :class="{ 'max-h-[400px]': !expanded && isLong }"
    >
      <div ref="slotRef" class="prose-code-block">
        <slot />
      </div>

      <!-- Gradient Overlay when collapsed -->
      <div
        v-if="!expanded && isLong"
        class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#2d2d2d] to-transparent pointer-events-none"
      ></div>
    </div>

    <!-- Expand Button -->
    <button
      v-if="isLong"
      @click="expanded = !expanded"
      class="w-full py-2 text-xs font-medium text-center text-gray-400 hover:text-white bg-[#2d2d2d] hover:bg-[#363636] border-t border-gray-700 transition-colors flex items-center justify-center gap-1"
    >
      <span v-if="expanded">Thu gọn</span>
      <span v-else>Xem thêm {{ overflowHeight }}px ...</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const expanded = ref(false);
const copied = ref(false);
const isLong = ref(false);
const slotRef = ref<HTMLElement | null>(null);
const overflowHeight = ref(0);

const checkHeight = () => {
  if (slotRef.value) {
    const height = slotRef.value.offsetHeight;
    if (height > 400) {
      isLong.value = true;
      overflowHeight.value = Math.round(height - 400);
    }
  }
};

const copyCode = async () => {
  if (!slotRef.value) return;

  const code = slotRef.value.innerText;
  try {
    await navigator.clipboard.writeText(code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

onMounted(() => {
  // Check height after render using requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    setTimeout(checkHeight, 100);
  });
});
</script>

<style>
/* Override Prism styles just in case for consistent padding */
.prose-code-block pre {
  margin: 0 !important;
  border-radius: 0 !important;
  background-color: transparent !important;
  padding: 1.5rem !important;
  overflow-x: auto;
  font-family: "Fira Code", "JetBrains Mono", monospace;
  font-size: 0.9em;
  line-height: 1.6;
}
</style>
