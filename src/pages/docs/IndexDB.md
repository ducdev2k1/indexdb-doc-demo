# Hướng dẫn IndexDB cho người mới bắt đầu 🚀

Chào mừng bạn đến với tài liệu hướng dẫn về **IndexedDB**! Đây là nơi chúng ta sẽ tìm hiểu về cách lưu trữ dữ liệu lớn ngay trên trình duyệt một cách hiệu quả.

---

## 1. IndexedDB là gì? 🤔

**IndexedDB** là một hệ thống cơ sở dữ liệu NoSQL transactional mức thấp (low-level) được tích hợp sẵn trong trình duyệt. Nó cho phép bạn lưu trữ một lượng lớn dữ liệu có cấu trúc (bao gồm cả File/Blob) và thực hiện tìm kiếm nhanh chóng qua các index (chỉ mục).

### Tại sao lại cần IndexedDB?

Trong khi `localStorage` rất tiện lợi, nó lại có giới hạn dung lượng nhỏ (khoảng 5MB) và chỉ lưu được chuỗi (string). IndexedDB sinh ra để giải quyết bài toán:

- **Lưu trữ lớn**: Vài trăm MB đến vài GB (tùy trình duyệt và ổ cứng).
- **Hiệu năng cao**: Hoạt động bất đồng bộ (Asynchronous), không làm đơ giao diện khi đọc/ghi nhiều.
- **Dữ liệu phức tạp**: Lưu được Object, Array, Date, File, Blob, Image... mà không cần ép kiểu về chuỗi JSON.

---

## 2. So sánh IndexDB vs LocalStorage vs SessionStorage 📊

Dưới đây là bảng so sánh nhanh giúp bạn dễ hình dung:

| Đặc điểm           | IndexedDB 🗄️                                 | LocalStorage 📦                     | SessionStorage ⏳       |
| :----------------- | :------------------------------------------- | :---------------------------------- | :---------------------- |
| **Dung lượng**     | **Rất lớn** (>500MB hoặc % ổ cứng)           | **Nhỏ** (~5-10MB)                   | **Nhỏ** (~5MB)          |
| **Kiểu dữ liệu**   | String, Number, Object, Array, Blob, File... | Chỉ **String**                      | Chỉ **String**          |
| **Cơ chế**         | **Bất đồng bộ (Async)** (Không chặn UI)      | **Đồng bộ (Sync)** (Có thể chặn UI) | **Đồng bộ (Sync)**      |
| **Thời gian sống** | Vĩnh viễn (đến khi user xóa)                 | Vĩnh viễn (đến khi user xóa)        | Mất khi tắt tab/browser |
| **Tìm kiếm**       | Có hỗ trợ Index (Tìm cực nhanh)              | Không (Phải duyệt tuần tự)          | Không                   |
| **Sử dụng khi**    | App offline, cache ảnh/file, lưu data lớn    | Setting đơn giản, token, theme      | Data tạm thời của phiên |

---

## 3. Dữ liệu được lưu ở đâu? 📍

Bạn có thể xem trực tiếp dữ liệu IndexedDB của mình ngay trên trình duyệt:

1.  Mở **DevTools** (F12 hoặc chuột phải -> Inspect).
2.  Chuyển sang tab **Application**.
3.  Ở menu bên trái, tìm mục **Storage** -> **IndexedDB**.
4.  Tại đây bạn sẽ thấy các Database, Object Store (giống Table) và dữ liệu bên trong.

---

## 4. Cách sử dụng (Chưa dùng thư viện - Vanilla JS) 🍦

Code thuần của IndexedDB dựa trên các sự kiện (`onsuccess`, `onerror`), nên trông sẽ hơi dài và phức tạp hơn (`callback hell`).

### Ví dụ cơ bản:

```javascript
// 1. Mở kết nối Database
const request = indexedDB.open("MyDatabase", 1);

// Chạy khi tạo mới hoặc tăng version (nơi để tạo bảng)
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  // Tạo Object Store (giống Table) tên là 'users' với key chính là 'id'
  if (!db.objectStoreNames.contains("users")) {
    db.createObjectStore("users", { keyPath: "id" });
  }
};

request.onsuccess = (event) => {
  const db = event.target.result;
  console.log("Kết nối thành công!");

  // 2. Thêm dữ liệu (Transaction)
  const transaction = db.transaction(["users"], "readwrite");
  const store = transaction.objectStore("users");

  const user = { id: 1, name: "Nguyen Van A", role: "Dev" };
  const addRequest = store.add(user);

  addRequest.onsuccess = () => console.log("Đã thêm user!");
  addRequest.onerror = () => console.error("Lỗi thêm user");
};

request.onerror = (event) => {
  console.error("Lỗi mở DB:", event.target.error);
};
```

---

## 5. Cách sử dụng (Dùng thư viện `idb`) 🛠️

Vì Vanilla JS hơi rườm rà, cộng đồng thường dùng thư viện `idb` (của Jake Archibald - Google) để bọc lại dưới dạng **Promise**, giúp code gọn gàng hơn nhiều với `async/await`.

### Cài đặt:

```bash
npm install idb
```

### Ví dụ tương đương (Dùng `idb`):

```typescript
import { openDB } from "idb";

async function demoIDB() {
  // 1. Mở kết nối (Gọn hơn nhiều!)
  const db = await openDB("MyDatabase", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "id" });
      }
    },
  });

  // 2. Thêm dữ liệu
  await db.add("users", { id: 1, name: "Nguyen Van A", role: "Dev" });
  console.log("Đã thêm user!");

  // 3. Đọc dữ liệu
  const user = await db.get("users", 1);
  console.log("User lấy được:", user);

  // 4. Lấy tất cả
  const allUsers = await db.getAll("users");
}
```

---

## 6. Ví dụ Cache thực tế trong Project 📸

Trong project này, bạn có thể xem file `src/pages/demo/ImageGallery.vue`. Đây là demo cache ảnh (Blob) để app hoạt động offline và tải nhanh hơn.

### Luồng hoạt động (Logic Cache):

1.  **Check Cache**: Khi cần hiển thị ảnh, kiểm tra trong IndexedDB có chưa.
2.  **Hit Cache**: Nếu có -> Lấy Blob từ DB -> Tạo URL (`URL.createObjectURL`) -> Hiển thị ngay lập tức.
3.  **Miss Cache**: Nếu chưa có -> Fetch từ server -> Hiển thị -> Lưu Blob vào IndexedDB cho lần sau.

### Code trích đoạn (Minh họa):

```typescript
// Định nghĩa Schema cho TypeScript
interface ImageCacheDB extends DBSchema {
  "image-cache": {
    key: string; // ID ảnh
    value: CachedImage; // Object chứa Blob ảnh
  };
}

// Hàm Cache ảnh
const cacheImages = async (images) => {
  const db = await dbPromise; // Kết nối DB bằng thư viện idb

  for (const img of images) {
    // 1. Tải ảnh từ mạng về dạng Blob
    const response = await fetch(img.url);
    const blob = await response.blob();

    // 2. Lưu Blob vào IndexedDB
    await db.put("image-cache", {
      id: img.id,
      url: img.url,
      blob: blob, // <--- IndexedDB lưu được cả file Blob!
      cachedAt: Date.now(),
    });
  }
};
```

👉 **Tại sao hay?** `localStorage` không thể lưu Blob hiệu quả (phải convert base64 rất nặng). IndexedDB lưu trực tiếp Blob, nên việc load lại hàng trăm ảnh từ cache cực nhanh và không tốn băng thông mạng.

---

Hi vọng tài liệu này giúp bạn nắm bắt được IndexedDB! Nếu cần demo chi tiết hơn, bạn cứ mở tab **Demo** trong menu nhé! 😉
