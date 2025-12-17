<script setup lang="ts">
import { openDB, type DBSchema } from "idb";
import { onMounted, ref } from "vue";

interface PicsumImage {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

interface CachedImage {
  id: string;
  author: string;
  url: string;
  blob: Blob;
  cachedAt: number;
}

interface ImageCacheDB extends DBSchema {
  "image-cache": {
    key: string;
    value: CachedImage;
  };
}

const dbPromise = openDB<ImageCacheDB>("image-cache-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("image-cache")) {
      db.createObjectStore("image-cache", { keyPath: "id" });
    }
  },
});

interface GalleryImage {
  id: string;
  author: string;
  originalUrl: string;
  displayUrl: string;
  objectUrl: string | null;
  loading: boolean;
  cached: boolean;
}

const images = ref<GalleryImage[]>([]);
const isLoading = ref(false);
const cacheStats = ref({ total: 0, size: 0 });

// Fetch danh sách ảnh từ Picsum API
const fetchImageList = async (): Promise<PicsumImage[]> => {
  const allImages: PicsumImage[] = [];
  // Lấy 50 trang, mỗi trang 10 ảnh = 500 ảnh cố định
  for (let page = 1; page <= 5; page++) {
    try {
      const response = await fetch(
        `https://picsum.photos/v2/list?page=${page}&limit=100`
      );
      const data = await response.json();
      allImages.push(...data);
    } catch (e) {
      console.error(`Lỗi tải trang ${page}:`, e);
    }
  }
  return allImages;
};

// Fetch và cache ảnh vào IndexedDB
const fetchAndCacheImage = async (img: GalleryImage) => {
  const db = await dbPromise;

  // Kiểm tra cache trước
  const cached = await db.get("image-cache", img.id);
  if (cached) {
    img.objectUrl = URL.createObjectURL(cached.blob);
    img.cached = true;
    img.loading = false;
    return;
  }

  // Fetch từ network nếu chưa cache
  try {
    const response = await fetch(img.displayUrl);
    const blob = await response.blob();

    // Lưu vào IndexedDB
    await db.put("image-cache", {
      id: img.id,
      author: img.author,
      url: img.displayUrl,
      blob,
      cachedAt: Date.now(),
    });

    img.objectUrl = URL.createObjectURL(blob);
    img.cached = false; // Vừa tải mới
    img.loading = false;
  } catch (error) {
    console.error("Lỗi tải ảnh:", img.id, error);
    img.loading = false;
  }
};

// Load tất cả ảnh - ưu tiên từ cache
const loadImages = async () => {
  isLoading.value = true;

  try {
    const db = await dbPromise;
    const cachedImages = await db.getAll("image-cache");

    // Nếu đã có cache -> load từ cache (nhanh!)
    if (cachedImages.length > 0) {
      images.value = cachedImages.map((cached) => ({
        id: cached.id,
        author: cached.author,
        originalUrl: cached.url,
        displayUrl: cached.url,
        objectUrl: URL.createObjectURL(cached.blob),
        loading: false,
        cached: true,
      }));
      await updateCacheStats();
      isLoading.value = false;
      return;
    }

    // Chưa có cache -> fetch danh sách từ API
    const picsumImages = await fetchImageList();

    // Hiển thị ảnh NGAY LẬP TỨC bằng URL trực tiếp (không chờ cache)
    images.value = picsumImages.map((img) => ({
      id: img.id,
      author: img.author,
      originalUrl: img.download_url,
      displayUrl: `https://picsum.photos/id/${img.id}/400/300`,
      objectUrl: `https://picsum.photos/id/${img.id}/400/300`, // Dùng URL trực tiếp
      loading: false,
      cached: false,
    }));

    isLoading.value = false;

    // Cache ảnh trong BACKGROUND (không chặn UI)
    cacheImagesInBackground();
  } catch (error) {
    console.error("Lỗi tải danh sách ảnh:", error);
    isLoading.value = false;
  }
};

// Cache ảnh trong background - song song theo batch
const cacheImagesInBackground = async () => {
  const db = await dbPromise;
  const batchSize = 100; // Cache 100 ảnh cùng lúc

  for (let i = 0; i < images.value.length; i += batchSize) {
    const batch = images.value.slice(i, i + batchSize);

    // Xử lý song song trong batch
    await Promise.all(
      batch.map(async (img) => {
        try {
          // Kiểm tra đã cache chưa
          const existing = await db.get("image-cache", img.id);
          if (existing) {
            img.cached = true;
            return;
          }

          // Fetch và lưu vào IndexedDB
          const response = await fetch(img.displayUrl);
          const blob = await response.blob();

          await db.put("image-cache", {
            id: img.id,
            author: img.author,
            url: img.displayUrl,
            blob,
            cachedAt: Date.now(),
          });

          img.cached = true;
        } catch (error) {
          console.error("Lỗi cache ảnh:", img.id, error);
        }
      })
    );

    // Cập nhật stats sau mỗi batch
    await updateCacheStats();
  }
};

// Cập nhật thống kê cache
const updateCacheStats = async () => {
  const db = await dbPromise;
  const all = await db.getAll("image-cache");
  let totalSize = 0;
  for (const item of all) {
    totalSize += item.blob.size;
  }
  cacheStats.value = {
    total: all.length,
    size: Math.round(totalSize / 1024),
  };
};

// Xoá toàn bộ cache
const clearCache = async () => {
  const db = await dbPromise;
  const tx = db.transaction("image-cache", "readwrite");
  await tx.objectStore("image-cache").clear();
  await tx.done;

  // Giải phóng object URLs
  images.value.forEach((img) => {
    if (img.objectUrl) {
      URL.revokeObjectURL(img.objectUrl);
    }
    img.objectUrl = null;
    img.cached = false;
  });

  await updateCacheStats();
  alert("Đã xoá cache! Tải lại trang để lấy ảnh mới.");
};

// Tải lại gallery
const refreshGallery = () => {
  images.value.forEach((img) => {
    if (img.objectUrl) {
      URL.revokeObjectURL(img.objectUrl);
    }
  });
  loadImages();
};

onMounted(() => {
  loadImages();
});
</script>

<template>
  <div class="space-y-8">
    <!-- Tiêu đề -->
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div>
        <h1
          class="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent"
        >
          🖼️ Bộ sưu tập ảnh - Cache Demo
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Ảnh được lấy từ
          <a
            href="https://picsum.photos"
            target="_blank"
            class="text-blue-500 hover:underline"
            >Picsum Photos</a
          >
          và lưu vào IndexedDB.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="refreshGallery"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <svg
            class="w-4 h-4"
            :class="{ 'animate-spin': isLoading }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
          Tải lại
        </button>
        <button
          @click="clearCache"
          class="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
        >
          Xoá Cache
        </button>
      </div>
    </div>

    <!-- Thống kê Cache -->
    <div
      class="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur border border-gray-200/50 dark:border-gray-700/50"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl">📦</span>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Số ảnh đã cache
          </div>
          <div class="font-bold text-lg">{{ cacheStats.total }} ảnh</div>
        </div>
      </div>
      <div class="w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
      <div class="flex items-center gap-2">
        <span class="text-2xl">💾</span>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Dung lượng cache
          </div>
          <div class="font-bold text-lg">{{ cacheStats.size }} KB</div>
        </div>
      </div>
      <div class="ml-auto flex items-center gap-2 text-sm">
        <span
          class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
        >
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Từ Cache
        </span>
        <span
          class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
        >
          <span class="w-2 h-2 rounded-full bg-blue-500"></span>
          Vừa tải
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && images.length === 0" class="text-center py-12">
      <svg
        class="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p class="text-gray-500 dark:text-gray-400">Đang tải danh sách ảnh...</p>
    </div>

    <!-- Lưới ảnh -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="img in images"
        :key="img.id"
        class="relative group overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 aspect-[4/3] shadow-lg"
      >
        <!-- Trạng thái đang tải -->
        <div
          v-if="img.loading"
          class="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse"
        >
          <svg
            class="w-8 h-8 text-gray-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>

        <!-- Ảnh -->
        <img
          v-if="img.objectUrl"
          :src="img.objectUrl"
          :alt="`Ảnh bởi ${img.author}`"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        <!-- Badge trạng thái cache -->
        <div
          v-if="!img.loading"
          class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium backdrop-blur"
          :class="
            img.cached
              ? 'bg-green-500/80 text-white'
              : 'bg-blue-500/80 text-white'
          "
        >
          {{ img.cached ? "✓ Từ Cache" : "↓ Vừa tải" }}
        </div>

        <!-- Overlay thông tin -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
        >
          <div>
            <div class="text-white text-sm font-medium">{{ img.author }}</div>
            <div class="text-gray-300 text-xs">ID: {{ img.id }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Thông tin hướng dẫn -->
    <div
      class="p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/30"
    >
      <h3 class="font-bold text-lg text-amber-800 dark:text-amber-300 mb-2">
        💡 Cách hoạt động
      </h3>
      <ul class="space-y-2 text-amber-700 dark:text-amber-400 text-sm">
        <li>• Ảnh được lấy từ Picsum Photos API với ID cố định (500 ảnh)</li>
        <li>• Mỗi ảnh được lưu dưới dạng Blob vào IndexedDB</li>
        <li>• Lần truy cập sau, ảnh tải từ cache - nhanh hơn rất nhiều!</li>
        <li>• Thử tắt mạng và tải lại trang - ảnh vẫn hiển thị! 🔥</li>
      </ul>
    </div>
  </div>
</template>
