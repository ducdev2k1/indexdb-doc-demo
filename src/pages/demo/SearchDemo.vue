<script setup lang="ts">
import { openDB, type DBSchema } from "idb";
import { onMounted, ref, watch } from "vue";

// 1. Định nghĩa cấu trúc dữ liệu và DB
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  age: number;
}

interface SearchDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: {
      "by-name": string;
      "by-role": string;
      "by-age": number;
      "by-email": string;
    };
  };
}

const dbPromise = openDB<SearchDB>("search-demo-db", 2, {
  upgrade(db, oldVersion, _newVersion, transaction) {
    let store;
    if (oldVersion === 0) {
      store = db.createObjectStore("users", { keyPath: "id" });
      store.createIndex("by-name", "name");
      store.createIndex("by-role", "role");
      store.createIndex("by-age", "age");
    } else {
      store = transaction.objectStore("users");
    }

    if (!store.indexNames.contains("by-email")) {
      store.createIndex("by-email", "email");
    }
  },
});

// 2. State
// 2. State
const searchQuery = ref("");
const searchRole = ref<"all" | "admin" | "user" | "guest">("all");
const searchCriteria = ref<"name" | "email" | "age">("name");
const results = ref<User[]>([]);
const totalRecords = ref(0);
const isGenerating = ref(false);
const searchTime = ref<number | null>(null);

// 3. Hàm tạo dữ liệu mẫu lớn (10,000 records)
const generateData = async () => {
  isGenerating.value = true;
  const db = await dbPromise;
  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");

  // Xóa cũ trước
  await store.clear();

  const roles: ("admin" | "user" | "guest")[] = ["admin", "user", "guest"];
  const firstNames = [
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
  const lastNames = [
    "Van",
    "Thi",
    "Minh",
    "Quoc",
    "Tuan",
    "Anh",
    "Duc",
    "Phuong",
    "Thao",
    "Hieu",
  ];
  const endNames = [
    "A",
    "B",
    "C",
    "X",
    "Y",
    "Z",
    "Hung",
    "Dung",
    "Thinh",
    "Long",
  ];

  const users: User[] = [];

  // Tạo 10,000 user
  for (let i = 0; i < 10000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const middleName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const lastName = endNames[Math.floor(Math.random() * endNames.length)];
    const fullName = `${firstName} ${middleName} ${lastName}`;

    users.push({
      id: crypto.randomUUID(),
      name: fullName,
      email: `user${i}@example.com`,
      role: roles[Math.floor(Math.random() * roles.length)] as
        | "admin"
        | "user"
        | "guest",
      age: Math.floor(Math.random() * 60) + 18,
    });
  }

  // Batch insert cho nhanh
  await Promise.all(users.map((u) => store.add(u)));
  await tx.done;

  isGenerating.value = false;
  await countRecords();
  alert("Đã tạo xong 10,000 bản ghi!");
};

const countRecords = async () => {
  const db = await dbPromise;
  totalRecords.value = await db.count("users");
};

// 4. Tìm kiếm sử dụng Index
// 4. Tìm kiếm sử dụng Index
const handleSearch = async () => {
  const start = performance.now();
  const db = await dbPromise;

  let foundUsers: User[] = [];

  // Logic tìm kiếm kết hợp
  // Nếu có chọn Role, ta ưu tiên filter theo Role bằng Index trước (vì số lượng ít hơn toàn bộ DB)
  if (searchRole.value !== "all") {
    // 1. Lấy tất cả user thuộc Role (dùng Index -> Nhanh)
    let byRole = await db.getAllFromIndex(
      "users",
      "by-role",
      searchRole.value as "admin" | "user" | "guest"
    );

    // 2. Filter tiếp theo Search Query (trên RAM)
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      if (searchCriteria.value === "name") {
        byRole = byRole.filter((u) => u.name.toLowerCase().includes(q));
      } else if (searchCriteria.value === "email") {
        byRole = byRole.filter((u) => u.email.toLowerCase().includes(q));
      } else if (searchCriteria.value === "age") {
        byRole = byRole.filter((u) => u.age.toString() === q);
      }
    }
    foundUsers = byRole;
  } else if (searchQuery.value) {
    // Nếu không chọn Role, tìm query trực tiếp
    // Tối ưu: Dùng Index tương ứng nếu có thể

    if (searchCriteria.value === "email") {
      // Tìm chính xác Email (hoặc range nếu cần, ở đây demo chính xác hoặc filter)
      // Index 'by-email' hữu dụng cho exact match
      // Nếu user nhập "user1@example.com" -> Hit Index ngay
      if (searchQuery.value.includes("@")) {
        // Giả sử tìm chính xác
        const res = await db.getFromIndex(
          "users",
          "by-email",
          searchQuery.value
        );
        foundUsers = res ? [res] : [];
      } else {
        // Tìm gần đúng (Contains) -> Index không hỗ trợ contains 'giữa chuỗi' tốt
        // Phải scan toàn bộ hoặc scan cursor.
        // Để demo nhanh: Scan all
        const all = await db.getAll("users");
        foundUsers = all.filter((u) =>
          u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      }
    } else if (searchCriteria.value === "age") {
      // Tìm chính xác Tuổi bằng Index -> CỰC NHANH
      const age = parseInt(searchQuery.value);
      if (!isNaN(age)) {
        foundUsers = await db.getAllFromIndex("users", "by-age", age);
      }
    } else {
      // Tìm theo Tên (Contains) -> Scan all
      const all = await db.getAll("users");
      foundUsers = all.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    }
  } else {
    // Không search gì cả -> Lấy 50 bản ghi đầu
    const tx = db.transaction("users");
    let cursor = await tx.store.openCursor();
    while (cursor && foundUsers.length < 50) {
      foundUsers.push(cursor.value);
      cursor = await cursor.continue();
    }
  }

  // Giới hạn hiển thị 100 kết quả để không đơ DOM
  results.value = foundUsers.slice(0, 100);
  searchTime.value = performance.now() - start;
};

// Tự động search khi input đổi (debounce nhẹ)
let timeout: any;
watch([searchQuery, searchRole, searchCriteria], () => {
  clearTimeout(timeout);
  timeout = setTimeout(handleSearch, 300);
});

onMounted(() => {
  countRecords();
  handleSearch();
});
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h1
        class="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent"
      >
        🔍 Demo Tìm Kiếm Nhanh (Indexing)
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Trải nghiệm sức mạnh của Index trong IndexedDB với 10,000 bản ghi.
      </p>
    </div>

    <!-- Stats & Generator -->
    <div
      class="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Tổng số bản ghi
        </div>
        <div class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ totalRecords.toLocaleString() }}
        </div>
      </div>

      <button
        @click="generateData"
        :disabled="isGenerating"
        class="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isGenerating" class="animate-spin">⏳</span>
        <span v-else>⚡</span>
        {{ isGenerating ? "Đang tạo dữ liệu..." : "Tạo 10,000 User Mẫu" }}
      </button>
    </div>

    <!-- Search Controls -->
    <div class="space-y-4">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search Criteria -->
        <select
          v-model="searchCriteria"
          class="w-full md:w-32 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium"
        >
          <option value="name">Tên</option>
          <option value="email">Email</option>
          <option value="age">Tuổi</option>
        </select>

        <!-- Input Search -->
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            :type="searchCriteria === 'age' ? 'number' : 'text'"
            :placeholder="
              searchCriteria === 'name'
                ? 'Tìm theo tên...'
                : searchCriteria === 'email'
                ? 'Nhập email (vd: user1@example.com)'
                : 'Nhập tuổi chính xác...'
            "
            class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            >🔍</span
          >
        </div>

        <!-- Filter Role -->
        <select
          v-model="searchRole"
          class="w-full md:w-40 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="guest">Guest</option>
        </select>
      </div>

      <!-- Performance Metrics -->
      <div
        v-if="searchTime !== null"
        class="text-sm text-gray-500 dark:text-gray-400 text-right"
      >
        Tìm thấy {{ results.length }} kết quả trong
        <span class="font-bold text-indigo-500"
          >{{ searchTime.toFixed(2) }}ms</span
        >
      </div>
    </div>

    <!-- Results Table -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="!w-full !inline-table text-left text-sm">
          <thead
            class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
          >
            <tr>
              <th class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                ID
              </th>
              <th class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                Họ Tên
              </th>
              <th class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                Vai trò
              </th>
              <th class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                Tuổi
              </th>
              <th class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                Email
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="user in results"
              :key="user.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="px-6 py-3 font-mono text-xs text-gray-500">
                {{ user.id.slice(0, 8) }}...
              </td>
              <td
                class="px-6 py-3 font-medium text-gray-900 dark:text-gray-100"
              >
                {{ user.name }}
              </td>
              <td class="px-6 py-3">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300':
                      user.role === 'admin',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300':
                      user.role === 'user',
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300':
                      user.role === 'guest',
                  }"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-3 text-gray-500 dark:text-gray-400">
                {{ user.age }}
              </td>
              <td class="px-6 py-3 text-gray-500 dark:text-gray-400">
                {{ user.email }}
              </td>
            </tr>
            <tr v-if="results.length === 0">
              <td
                colspan="5"
                class="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                Không tìm thấy kết quả nào.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Info -->
    <div
      class="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-sm border border-blue-100 dark:border-blue-800"
    >
      ℹ️ <strong>Mẹo:</strong> Thử tạo 10,000 bản ghi và tìm kiếm. Bạn sẽ thấy
      IndexedDB xử lý cực nhanh nhờ Index (đặc biệt khi filter theo Role).
    </div>
  </div>
</template>
