<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const tocItems = ref<TocItem[]>([]);
const activeId = ref("");

const extractHeadings = () => {
  const headings = document.querySelectorAll(
    ".markdown-body h2, .markdown-body h3"
  );
  const items: TocItem[] = [];

  headings.forEach((heading) => {
    const text = heading.textContent || "";
    // Tạo ID từ text (slug)
    const id =
      heading.id ||
      text
        .toLowerCase()
        .replace(
          /[^\w\sáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/g,
          ""
        )
        .replace(/\s+/g, "-");

    // Gán ID cho heading nếu chưa có
    if (!heading.id) {
      heading.id = id;
    }

    items.push({
      id,
      text: text.replace(/^[#\s]+/, "").trim(),
      level: heading.tagName === "H2" ? 2 : 3,
    });
  });

  tocItems.value = items;
};

const handleScroll = () => {
  const headings = document.querySelectorAll(
    ".markdown-body h2, .markdown-body h3"
  );
  let currentId = "";

  headings.forEach((heading) => {
    const rect = heading.getBoundingClientRect();
    if (rect.top <= 100) {
      currentId = heading.id;
    }
  });

  activeId.value = currentId;
};

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

onMounted(() => {
  // Chờ DOM render xong
  setTimeout(() => {
    extractHeadings();
  }, 100);

  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <nav
    v-if="tocItems.length > 0"
    class="hidden xl:block fixed right-8 top-32 w-64 max-h-[calc(100vh-10rem)] overflow-y-auto"
  >
    <div
      class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-lg"
    >
      <h4
        class="font-bold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3"
      >
        📑 Mục lục
      </h4>
      <ul class="space-y-1 text-sm">
        <li v-for="item in tocItems" :key="item.id">
          <a
            :href="'#' + item.id"
            @click.prevent="scrollToHeading(item.id)"
            :class="[
              'block py-1.5 px-2 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700',
              item.level === 3 ? 'pl-5 text-xs' : '',
              activeId === item.id
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium border-l-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-400',
            ]"
          >
            {{ item.text }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
nav::-webkit-scrollbar {
  width: 4px;
}
nav::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
