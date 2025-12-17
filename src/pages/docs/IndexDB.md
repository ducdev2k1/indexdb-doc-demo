<div class="prose lg:prose-xl dark:prose-invert">

# Hướng dẫn sử dụng IndexedDB với `idb` và TypeScript

IndexedDB là một API cấp thấp để lưu trữ lượng lớn dữ liệu có cấu trúc tại phía client (trình duyệt). Nó cho phép bạn tạo ra các ứng dụng web có khả năng làm việc offline mạnh mẽ.

Tuy nhiên, API gốc của IndexedDB dựa trên sự kiện (event-based) và khá phức tạp để sử dụng trực tiếp. Thư viện `idb` giúp đơn giản hóa việc này bằng cách bao đóng (wrapper) IndexedDB trong các Promise, giúp code dễ đọc và dễ quản lý hơn, đặc biệt khi kết hợp với async/await.

## Cài đặt

```bash
npm install idb
```

## Khởi tạo Database

Để làm việc với IndexedDB, đầu tiên chúng ta cần mở kết nối tới database. Nếu database chưa tồn tại hoặc version thay đổi, callback `upgrade` sẽ được gọi để chúng ta tạo Object Store.

```typescript
import { openDB, DBSchema } from "idb";

interface MyDB extends DBSchema {
  "user-store": {
    key: string;
    value: {
      id: string;
      name: string;
      email: string;
      note?: string;
      createdAt: number;
    };
    indexes: { "by-email": string };
  };
}

const dbPromise = openDB<MyDB>("my-database", 1, {
  upgrade(db) {
    // Tạo object store 'user-store' với keyPath là 'id'
    const userStore = db.createObjectStore("user-store", { keyPath: "id" });
    // Tạo index để tìm kiếm theo email
    userStore.createIndex("by-email", "email");
  },
});
```

## Các thao tác cơ bản

### Thêm hoặc Cập nhật dữ liệu (Put)

```typescript
export async function saveUser(user: any) {
  const db = await dbPromise;
  await db.put("user-store", user);
}
```

### Lấy dữ liệu (Get)

```typescript
export async function getUser(id: string) {
  const db = await dbPromise;
  return await db.get("user-store", id);
}
```

### Lấy tất cả dữ liệu (GetAll)

```typescript
export async function getAllUsers() {
  const db = await dbPromise;
  return await db.getAll("user-store");
}
```

### Xóa dữ liệu (Delete)

```typescript
export async function deleteUser(id: string) {
  const db = await dbPromise;
  await db.delete("user-store", id);
}
```

## Ứng dụng: Caching Form Data

Một ứng dụng phổ biến là lưu tạm dữ liệu form khi người dùng đang nhập liệu, để tránh mất dữ liệu khi reload trang hoặc mất mạng.

Xem trang [Demo](/demo/indexdb) để thấy ví dụ thực tế.

</div>
