<script setup lang="ts">
import { openDB, type DBSchema } from "idb";
import { onMounted, ref } from "vue";

interface UserData {
  id: string;
  name: string;
  email: string;
  note: string;
  updatedAt: number;
}

interface DemoDB extends DBSchema {
  "form-cache": {
    key: string;
    value: UserData;
  };
}

const dbPromise = openDB<DemoDB>("demo-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("form-cache")) {
      db.createObjectStore("form-cache", { keyPath: "id" });
    }
  },
});

const form = ref<UserData>({
  id: "current-draft",
  name: "",
  email: "",
  note: "",
  updatedAt: Date.now(),
});

const status = ref("");
const savedData = ref<UserData | null>(null);
const lastSaved = ref<string | null>(null);

onMounted(async () => {
  const db = await dbPromise;
  const cached = await db.get("form-cache", "current-draft");
  if (cached) {
    form.value = cached;
    status.value = "restored";
    lastSaved.value = new Date(cached.updatedAt).toLocaleTimeString();
  }
  loadSavedData();
});

const saveToCache = async () => {
  const db = await dbPromise;
  form.value.updatedAt = Date.now();
  await db.put("form-cache", JSON.parse(JSON.stringify(form.value)));
  lastSaved.value = new Date().toLocaleTimeString();
  status.value = "saved";
  loadSavedData();
};

const submitForm = async () => {
  alert("Form submitted! Data: " + JSON.stringify(form.value, null, 2));
};

const clearCache = async () => {
  const db = await dbPromise;
  await db.delete("form-cache", "current-draft");
  form.value = {
    id: "current-draft",
    name: "",
    email: "",
    note: "",
    updatedAt: Date.now(),
  };
  status.value = "cleared";
  savedData.value = null;
  lastSaved.value = null;
};

const loadSavedData = async () => {
  const db = await dbPromise;
  savedData.value = (await db.get("form-cache", "current-draft")) || null;
};
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h1
        class="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent"
      >
        📝 Demo Cache Form
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Dữ liệu form của bạn được tự động lưu vào IndexedDB khi bạn gõ.
      </p>
    </div>

    <!-- Status Banner -->
    <div
      v-if="status"
      class="flex items-center gap-3 p-4 rounded-xl backdrop-blur border"
      :class="{
        'bg-green-50/50 dark:bg-green-900/20 border-green-200/50 dark:border-green-700/30':
          status === 'saved',
        'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-700/30':
          status === 'restored',
        'bg-amber-50/50 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-700/30':
          status === 'cleared',
      }"
    >
      <span class="text-2xl">
        {{ status === "saved" ? "✅" : status === "restored" ? "🔄" : "🗑️" }}
      </span>
      <div>
        <div
          class="font-medium"
          :class="{
            'text-green-700 dark:text-green-300': status === 'saved',
            'text-blue-700 dark:text-blue-300': status === 'restored',
            'text-amber-700 dark:text-amber-300': status === 'cleared',
          }"
        >
          {{
            status === "saved"
              ? "Đã tự động lưu"
              : status === "restored"
              ? "Đã khôi phục dữ liệu"
              : "Đã xóa Cache"
          }}
        </div>
        <div v-if="lastSaved" class="text-sm text-gray-500 dark:text-gray-400">
          Lưu lần cuối lúc {{ lastSaved }}
        </div>
      </div>
    </div>

    <!-- Form Card -->
    <form
      @submit.prevent="submitForm"
      class="bg-white/50 dark:bg-gray-800/50 backdrop-blur p-8 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 space-y-6 max-w-xl"
    >
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Tên hiển thị
        </label>
        <input
          v-model="form.name"
          @input="saveToCache"
          type="text"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
          placeholder="Nhập tên của bạn..."
        />
      </div>

      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Địa chỉ Email
        </label>
        <input
          v-model="form.email"
          @input="saveToCache"
          type="email"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
          placeholder="email@vidu.com"
        />
      </div>

      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Ghi chú
        </label>
        <textarea
          v-model="form.note"
          @input="saveToCache"
          rows="4"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none"
          placeholder="Viết gì đó..."
        ></textarea>
      </div>

      <div class="flex gap-4 pt-2">
        <button
          type="submit"
          class="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all hover:-translate-y-0.5"
        >
          Gửi Form
        </button>
        <button
          type="button"
          @click="clearCache"
          class="px-6 py-3 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          Xóa Cache
        </button>
      </div>
    </form>

    <!-- Data Preview -->
    <div
      class="bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
    >
      <div
        class="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between"
      >
        <h3 class="font-semibold text-gray-900 dark:text-white">
          📦 Dữ liệu trong IndexedDB
        </h3>
        <button
          @click="loadSavedData"
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <svg
            class="w-4 h-4"
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
          Làm mới
        </button>
      </div>
      <pre
        class="p-6 text-sm text-gray-300 bg-gray-900 overflow-auto max-h-64"
      ><code>{{ savedData ? JSON.stringify(savedData, null, 2) : 'Chưa có dữ liệu cache' }}</code></pre>
    </div>

    <!-- Info Card -->
    <div
      class="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200/50 dark:border-green-700/30"
    >
      <h3 class="font-bold text-lg text-green-800 dark:text-green-300 mb-2">
        💡 Cách hoạt động
      </h3>
      <ul class="space-y-2 text-green-700 dark:text-green-400 text-sm">
        <li>• Mỗi lần gõ phím sẽ kích hoạt tự động lưu vào IndexedDB</li>
        <li>
          • Dữ liệu tồn tại qua các lần tải lại trang và phiên trình duyệt
        </li>
        <li>• Hoạt động hoàn toàn offline sau khi tải</li>
        <li>• Xóa cache để reset và bắt đầu lại</li>
      </ul>
    </div>
  </div>
</template>
