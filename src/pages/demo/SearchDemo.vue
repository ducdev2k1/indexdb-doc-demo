<template>
  <div class="space-y-6">
    <!-- Header Controls -->
    <div
      class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
    >
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
      >
        <h2
          class="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"
        >
          <span>🔍</span> Demo Sức Mạnh Index (50k bản ghi trong DB)
        </h2>

        <!-- Mode Switcher -->
        <div
          class="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-lg"
        >
          <button
            @click="useIndex = false"
            :class="
              !useIndex
                ? 'bg-white text-red-600 shadow-sm dark:bg-gray-700 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            "
            class="px-4 py-2 rounded-md text-sm font-medium transition-all"
          >
            🐢 JS Filter (Load All)
          </button>
          <button
            @click="useIndex = true"
            :class="
              useIndex
                ? 'bg-white text-green-600 shadow-sm dark:bg-gray-700 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            "
            class="px-4 py-2 rounded-md text-sm font-medium transition-all"
          >
            🚀 Index (Query Direct)
          </button>
        </div>
      </div>

      <!-- Controls Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search Criteria -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Tìm theo</label
          >
          <select
            v-model="searchCriteria"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="name">
              Tên {{ useIndex ? "(Bắt đầu bằng)" : "(Chứa)" }}
            </option>
            <option value="age">Khoảng Tuổi</option>
          </select>
        </div>

        <!-- Search Input -->
        <div class="col-span-1 md:col-span-2">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {{
              searchCriteria === "age" ? "Nhập khoảng tuổi" : "Từ khóa tìm kiếm"
            }}
          </label>

          <!-- Input cho Tuổi (Range) -->
          <div v-if="searchCriteria === 'age'" class="flex gap-2">
            <input
              v-model.number="minAge"
              type="number"
              placeholder="Min"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <span class="self-center">-</span>
            <input
              v-model.number="maxAge"
              type="number"
              placeholder="Max"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <!-- Input cho Text -->
          <div v-else class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nhập tên (VD: nguyen, tran, le)..."
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-4 flex flex-col md:flex-row gap-3 items-center">
        <button
          @click="generateData"
          :disabled="isGenerating"
          class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <span v-if="isGenerating">⏳ Đang tạo... {{ progress }}%</span>
          <span v-else>⚡ Tạo 50,000 User vào DB</span>
        </button>

        <!-- Progress Bar -->
        <div
          v-if="isGenerating"
          class="flex-1 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"
        >
          <div
            class="bg-green-600 h-2.5 rounded-full transition-all duration-300"
            :style="{ width: progress + '%' }"
          ></div>
        </div>

        <!-- RAM Status -->
        <div
          class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"
        >
          <span>💾 RAM:</span>
          <span class="font-mono">{{ results.length }} items</span>
          <span class="text-xs">(DB: {{ totalRecords.toLocaleString() }})</span>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div
      v-if="searchTime !== null"
      :class="
        useIndex
          ? 'bg-green-50 border-green-100 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
          : 'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
      "
      class="px-3 py-2 md:px-4 md:py-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between border gap-2"
    >
      <div class="flex items-center gap-3">
        <span class="text-2xl">{{ useIndex ? "🚀" : "🐢" }}</span>
        <div>
          <div class="font-bold">
            {{
              useIndex
                ? "Index Query (Chỉ lấy đúng cái cần)"
                : "JS Filter (Load 50k rồi lọc)"
            }}
          </div>
          <div class="text-sm opacity-80">
            Tìm thấy {{ results.length.toLocaleString() }} kết quả
            <span v-if="!useIndex" class="text-red-600 dark:text-red-400"
              >(Đã load {{ loadedCount.toLocaleString() }} dòng vào RAM!)</span
            >
          </div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-3xl font-bold">{{ searchTime.toFixed(2) }}ms</div>
        <div class="text-xs font-mono opacity-70">Processing Time</div>
      </div>
    </div>

    <!-- Virtual List Table -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <!-- Scrollable Table Container -->
      <div class="overflow-x-auto">
        <!-- Table Header (Static) -->
        <div
          class="grid grid-cols-12 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-200 text-xs md:text-sm min-w-[600px]"
        >
          <div class="col-span-1 p-2 md:p-4">STT</div>
          <div class="col-span-4 p-2 md:p-4">Tên</div>
          <div class="col-span-4 p-2 md:p-4">Email</div>
          <div class="col-span-2 p-2 md:p-4">Vai trò</div>
          <div class="col-span-1 p-2 md:p-4">Tuổi</div>
        </div>

        <!-- Virtual Content -->
        <div
          v-bind="containerProps"
          class="h-[500px] overflow-y-auto custom-scrollbar"
        >
          <div v-bind="wrapperProps">
            <div
              v-for="item in list"
              :key="item.index"
              class="grid grid-cols-12 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm items-center"
              style="height: 50px"
            >
              <div
                class="col-span-1 px-4 truncate text-gray-500 dark:text-gray-400 font-mono text-xs"
              >
                {{ item.index + 1 }}
              </div>
              <div
                class="col-span-4 px-4 font-medium text-gray-900 dark:text-gray-100 truncate"
              >
                {{ item.data.name }}
              </div>
              <div
                class="col-span-4 px-4 text-gray-600 dark:text-gray-300 truncate"
              >
                {{ item.data.email }}
              </div>
              <div class="col-span-2 px-4">
                <span
                  :class="{
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300':
                      item.data.role === 'admin',
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300':
                      item.data.role === 'user',
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300':
                      item.data.role === 'guest',
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium capitalize"
                >
                  {{ item.data.role }}
                </span>
              </div>
              <div class="col-span-1 px-4 text-gray-600 dark:text-gray-400">
                {{ item.data.age }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="results.length === 0 && !isSearching"
        class="p-8 text-center text-gray-500 dark:text-gray-400"
      >
        <div class="text-4xl mb-2">📦</div>
        <div>
          RAM trống.<br />
          <span v-if="totalRecords > 0"
            >{{ totalRecords.toLocaleString() }} bản ghi đang nằm trong
            IndexedDB.</span
          >
          <span v-else>Hãy tạo dữ liệu trước!</span>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="isSearching"
        class="p-8 text-center text-gray-500 dark:text-gray-400"
      >
        <div class="text-4xl mb-2 animate-pulse">⏳</div>
        <div>Đang tải dữ liệu...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVirtualList } from "@vueuse/core";
import { openDB, type DBSchema } from "idb";
import { onMounted, ref, watch } from "vue";

// Interface DB
interface SearchDB extends DBSchema {
  users: {
    key: string;
    value: {
      id: string;
      name: string;
      name_normalized: string;
      email: string;
      role: "admin" | "user" | "guest";
      age: number;
    };
    indexes: {
      "by-role": string;
      "by-age": number;
      "by-name-normalized": string;
    };
  };
}

const dbPromise = openDB<SearchDB>("search-demo-db", 5, {
  upgrade(db, oldVersion, _newVersion, transaction) {
    let store;
    if (oldVersion === 0) {
      store = db.createObjectStore("users", { keyPath: "id" });
      store.createIndex("by-role", "role");
      store.createIndex("by-age", "age");
      store.createIndex("by-name-normalized", "name_normalized");
    } else {
      store = transaction.objectStore("users");
      if (!store.indexNames.contains("by-name-normalized")) {
        store.createIndex("by-name-normalized", "name_normalized");
      }
    }
  },
});

// State
const searchQuery = ref("");
const minAge = ref<number>(25);
const maxAge = ref<number>(30);
const searchCriteria = ref<"name" | "age">("name");
const useIndex = ref(true);
const progress = ref(0);

const results = ref<any[]>([]);
const totalRecords = ref(0);
const loadedCount = ref(0); // Số lượng đã load vào RAM (cho JS Filter)
const isGenerating = ref(false);
const isSearching = ref(false);
const searchTime = ref<number | null>(null);

// Virtual List Setup
const { list, containerProps, wrapperProps } = useVirtualList(results, {
  itemHeight: 50,
});

const countRecords = async () => {
  const db = await dbPromise;
  totalRecords.value = await db.count("users");
};

// Tạo dữ liệu Mock (50k records) -> Lưu DB -> Xóa RAM
const generateData = async () => {
  isGenerating.value = true;
  progress.value = 0;
  const db = await dbPromise;

  await db.clear("users");

  const roles = ["admin", "user", "guest"] as const;
  const hovaten = [
    "Nguyen",
    "Tran",
    "Le",
    "Pham",
    "Hoang",
    "Huynh",
    "Phan",
    "Vu",
    "Vo",
    "Dang",
  ];
  const ten = [
    "An",
    "Binh",
    "Cuong",
    "Dung",
    "Giang",
    "Hung",
    "Khanh",
    "Lan",
    "Minh",
    "Nam",
  ];

  const batchSize = 10000;
  const totalRecordCount = 50000;
  const totalBatches = Math.ceil(totalRecordCount / batchSize);

  for (let b = 0; b < totalBatches; b++) {
    const tx = db.transaction("users", "readwrite");
    const promises = [];

    for (let i = 0; i < batchSize; i++) {
      const ho = hovaten[Math.floor(Math.random() * hovaten.length)];
      const t = ten[Math.floor(Math.random() * ten.length)]!;
      const fullName = `${ho} ${t} ${Math.floor(Math.random() * 10000)}`;
      const age = Math.floor(Math.random() * 50) + 18;

      promises.push(
        tx.store.add({
          id: crypto.randomUUID(),
          name: fullName,
          name_normalized: fullName.toLowerCase(),
          email: `${t.toLowerCase()}.${b * batchSize + i}@example.com`,
          role: roles[Math.floor(Math.random() * roles.length)]!,
          age: age,
        })
      );
    }

    await Promise.all([...promises, tx.done]);
    progress.value = Math.round(((b + 1) / totalBatches) * 100);
    await new Promise((r) => setTimeout(r, 0));
  }

  isGenerating.value = false;
  await countRecords();

  // QUAN TRỌNG: Sau khi lưu xong, XÓA SẠCH RAM
  results.value = [];
  loadedCount.value = 0;
  searchTime.value = null;
};

// Tìm kiếm (Logic Core)
const handleSearch = async () => {
  if (!searchQuery.value && searchCriteria.value === "name") return;

  isSearching.value = true;
  searchTime.value = null;
  loadedCount.value = 0;

  await new Promise((r) => setTimeout(r, 50)); // Cho UI kịp render loading
  const start = performance.now();

  const db = await dbPromise;
  let foundUsers: any[] = [];

  const queryLower = searchQuery.value.toLowerCase();

  // --- CASE 1: JS FILTER (Load 50k vào RAM rồi lọc) ---
  if (!useIndex.value) {
    // Bước 1: Load TOÀN BỘ 50k từ IndexedDB lên RAM
    const allUsers = await db.getAll("users");
    loadedCount.value = allUsers.length; // Ghi lại số lượng đã load

    // Bước 2: Filter bằng JS (O(n))
    if (searchCriteria.value === "age") {
      foundUsers = allUsers.filter(
        (u) => u.age >= minAge.value && u.age <= maxAge.value
      );
    } else {
      foundUsers = allUsers.filter((u) =>
        u.name_normalized.includes(queryLower)
      );
    }
  }
  // --- CASE 2: INDEX QUERY (Chỉ lấy đúng cái cần) ---
  else {
    if (searchCriteria.value === "age") {
      const range = IDBKeyRange.bound(minAge.value, maxAge.value);
      foundUsers = await db.getAllFromIndex("users", "by-age", range);
    } else {
      // Prefix search trực tiếp trên Index
      const range = IDBKeyRange.bound(queryLower, queryLower + "\uffff");
      foundUsers = await db.getAllFromIndex(
        "users",
        "by-name-normalized",
        range
      );
    }
    loadedCount.value = foundUsers.length; // Chỉ load đúng số này
  }

  results.value = foundUsers;
  searchTime.value = performance.now() - start;
  isSearching.value = false;
};

// Auto Search with debounce
let timeout: ReturnType<typeof setTimeout>;
watch([searchQuery, minAge, maxAge, searchCriteria, useIndex], () => {
  clearTimeout(timeout);
  timeout = setTimeout(handleSearch, 300);
});

onMounted(() => {
  countRecords();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
