# 📘 Hướng dẫn Toàn diện về IndexedDB: Từ A-Z

Chào mừng bạn đến với **Cẩm nang IndexedDB**! Tài liệu này sẽ đưa bạn từ một người mới bắt đầu trở thành chuyên gia về lưu trữ dữ liệu phía Client.

---

## 1. Mở đầu: Tại sao lại là IndexedDB? 🤔

Trong thế giới Web hiện đại, chúng ta không chỉ hiển thị thông tin mà còn chạy các ứng dụng phức tạp (PWA, Web App). Nhu cầu lưu trữ dữ liệu **LỚN** và **NHANH** ngay trên trình duyệt là bắt buộc.

### So sánh nhanh các công nghệ lưu trữ

| Đặc điểm            | IndexedDB 🗄️                       | LocalStorage 📦             | Cookies 🍪        |
| :------------------ | :--------------------------------- | :-------------------------- | :---------------- |
| 💾 **Dung lượng**   | **Rất lớn** (>Hundreds MB)         | **Nhỏ** (~5MB)              | **Rất nhỏ** (4KB) |
| 🔢 **Kiểu dữ liệu** | Object, Array, Blob, File, Date... | Chỉ String                  | Chỉ String        |
| ⚡ **Hiệu năng**    | **Async** (Không chặn UI)          | Sync (Chặn UI nếu data lớn) | Sync              |
| 🔍 **Tìm kiếm**     | Có Index (Tìm siêu nhanh)          | Duyệt tuần tự (Chậm)        | Không             |
| 💡 **Mục đích**     | App offline, data lớn, cache file  | Config, token, theme        | Auth, tracking    |

---

## 1.1. Ưu điểm và Nhược điểm (Pros & Cons) ⚖️

Mặc dù IndexedDB rất mạnh, nhưng không phải là "viên đạn bạc" cho mọi vấn đề.

### ✅ Ưu điểm (Pros)

1.  **Lưu trữ khổng lồ**: Thoải mái lưu hàng GB dữ liệu (phụ thuộc ổ cứng người dùng).
2.  **Hiệu năng cao**: Cơ chế bất đồng bộ (Async) giúp UI luôn mượt mà kể cả khi ghi đọc file nặng.
3.  **Hỗ trợ đa dạng**: Lưu được Blob, File, ArrayBuffer trực tiếp (không cần base64).
4.  **Transaction an toàn**: Đảm bảo toàn vẹn dữ liệu (ACID basics).
5.  **Offline-first**: Chìa khóa vàng cho các ứng dụng PWA hoạt động không cần mạng.

### ❌ Nhược điểm (Cons)

1.  **API phức tạp**: Code thuần (Vanilla JS) rất rắc rối, nhiều sự kiện (`onsuccess`, `onerror`).
2.  **Khó Debug**: DevTools hỗ trợ xem dữ liệu nhưng khó thao tác sửa/xóa nhanh như LocalStorage.
3.  **Tương thích**: Các trình duyệt rất cũ có thể hỗ trợ không đầy đủ (nhưng hiện tại >99% đã Ok).
4.  **Vấn đề Quota**: Nếu ổ cứng đầy, trình duyệt có thể tự xóa dữ liệu để giải phóng bộ nhớ (ít gặp nhưng có thể xảy ra).

---

## 2. Tư duy cốt lõi (Core Concepts) 🧠

Để làm chủ IndexedDB, bạn cần hiểu 4 khái niệm sau (tưởng tượng như một **Tủ hồ sơ**):

1.  **Database (Cơ sở dữ liệu)**:

    - Là cái **Tủ hồ sơ**. Mỗi ứng dụng có thể có nhiều tủ (Database), nhưng thường chỉ cần một.
    - _Đặc biệt_: Nó có **Version** (Phiên bản). Khi muốn thay đổi cấu trúc tủ (thêm ngăn), bạn phải tăng Version này lên.

2.  **Object Store (Kho chứa đối tượng)**:

    - Là các **Table (Bảng)** hoặc **Collection**.
    - Tương đương với **Table** trong SQL hoặc **Collection** trong MongoDB.
    - Nơi chứa dữ liệu thực tế (User, Product, Order...).

3.  **Index (Chỉ mục)**:

    - Là các **Nhãn dán** bên ngoài hồ sơ.
    - Giúp bạn tìm kiếm cực nhanh (Ví dụ: tìm theo _Email_ hoặc _Tuổi_) mà không cần lật từng hồ sơ một.

4.  **Transaction (Giao dịch)**:
    - Là quy tắc **"Làm xong hết hoặc không làm gì cả"**.
    - Mọi thao tác đọc/ghi đều phải nằm trong một Transaction. Nếu đang ghi mà lỗi -> Tự động hoàn tác (Rollback) như chưa có gì xảy ra. An toàn tuyệt đối!

---

## 3. Dữ liệu được lưu ở đâu trên máy? (Physical Location) 📂

IndexedDB không lưu trên "mây" (Cloud) mà lưu trực tiếp vào ổ cứng máy tính của người dùng (trong thư mục Profile của trình duyệt).

### 📍 Đường dẫn vật lý (Tham khảo)

Nếu bạn muốn mò vào tận nơi để xem file (dù nó được mã hóa/binary khó đọc), đây là địa chỉ thường gặp:

**Google Chrome / Edge (Windows):**

```bash
%LOCALAPPDATA%\Google\Chrome\User Data\Default\IndexedDB
# Hoặc Edge:
%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\IndexedDB
```

**Firefox (Windows):**

```bash
%APPDATA%\Mozilla\Firefox\Profiles\<profile-id>\storage\default
```

**macOS (Chrome):**

```bash
~/Library/Application Support/Google/Chrome/Default/IndexedDB
```

### 🛠️ Xem nhanh bằng DevTools (Khuyên dùng)

Thay vì mò vào folder, hãy dùng công cụ có sẵn của trình duyệt:

1.  Nhấn **F12** để mở DevTools.
2.  Chuyển sang tab **Application** (Chrome/Edge) hoặc **Storage** (Firefox).
3.  Chọn mục **IndexedDB** ở thanh bên trái.
4.  Tại đây bạn có thể xem, sửa, xóa dữ liệu trực quan như Excel.

---

## 4. Cách sử dụng (Vanilla JS - Code thuần không thư viện) 🍦

_Dành cho bạn nào muốn hiểu sâu hoặc không muốn phụ thuộc thư viện bên thứ 3._

Cơ chế của Vanilla JS dựa trên sự kiện (Event-based), khá giống `DOM events`.

### 4.1. Mở Database

```javascript
const request = indexedDB.open("MyDatabase", 1);

// Chạy 1 lần duy nhất khi tạo mới hoặc tăng version
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  if (!db.objectStoreNames.contains("users")) {
    db.createObjectStore("users", { keyPath: "id" });
  }
};

request.onsuccess = (event) => {
  console.log("Mở DB thành công!");
  const db = event.target.result;
};
```

### 4.2. Thêm dữ liệu (Transaction)

```javascript
const addData = (db, user) => {
  // 1. Tạo Transaction (ghi)
  const tx = db.transaction(["users"], "readwrite");
  const store = tx.objectStore("users");

  // 2. Thêm
  const req = store.add(user);

  req.onsuccess = () => console.log("Thêm thành công!");
  req.onerror = () => console.error("Lỗi:", req.error);
};
```

### 4.3. Lấy dữ liệu

```javascript
const getData = (db, id) => {
  const tx = db.transaction(["users"], "readonly");
  const store = tx.objectStore("users");

  const req = store.get(id);
  req.onsuccess = () => console.log("User:", req.result);
};
```

👉 **Nhận xét**: Bạn sẽ thấy code thuần khá dài dòng ("Callback Hell"). Đó là lý do ta nên dùng thư viện `idb` ở phần dưới.

---

## 5. Bắt đầu với thư viện `idb` 🛠️

Code thuần (Vanilla JS) của IndexedDB rất dài dòng (`onsuccess`, `onerror`). Chúng ta sẽ dùng thư viện **`idb`** (của Google) để code gọn gàng bằng `async/await`.

### 3.1. Cài đặt

```bash
npm install idb
```

### 3.2. Khởi tạo Database (Mở "Tủ hồ sơ")

```typescript
import { openDB, type DBSchema } from "idb";

// 1. Định nghĩa kiểu dữ liệu (TypeScript)
interface MyDB extends DBSchema {
  users: {
    key: string;
    value: { id: string; name: string; email: string; age: number };
    indexes: { "by-email": string; "by-age": number }; // Các nhãn dán
  };
}

// 2. Mở kết nối
const db = await openDB<MyDB>("my-database", 1, {
  upgrade(db) {
    // Hàm này CHỈ chạy khi tạo mới hoặc tăng version
    // Nơi duy nhất để tạo Object Store & Index

    // Tạo ngăn kéo 'users', dùng 'id' làm khóa chính
    const store = db.createObjectStore("users", { keyPath: "id" });

    // Dán nhãn (Tạo index) để tìm kiếm sau này
    store.createIndex("by-email", "email", { unique: true }); // Email không trùng
    store.createIndex("by-age", "age");
  },
});
```

---

## 4. Thao tác dữ liệu (CRUD) �

### Thêm dữ liệu (Create)

```typescript
await db.add("users", {
  id: "user-01",
  name: "Nguyen Van A",
  email: "a@example.com",
  age: 25,
});
```

### Đọc dữ liệu (Read)

```typescript
// Lấy theo ID (Key chính)
const user = await db.get("users", "user-01");

// Lấy TẤT CẢ
const allUsers = await db.getAll("users");
```

### Cập nhật (Update)

```typescript
// put: Nếu chưa có thì Thêm, có rồi thì Đè (Update)
await db.put("users", {
  id: "user-01",
  name: "Nguyen Van A (Updated)", // Tên mới
  email: "a@example.com",
  age: 26,
});
```

### Xóa (Delete)

```typescript
await db.delete("users", "user-01");
```

---

## 5. Sức mạnh tìm kiếm (Indexes & Range) 🚀

Đây là lý do chính ta chọn IndexedDB thay vì LocalStorage: **Khả năng tìm kiếm mạnh mẽ**.

### Tìm chính xác bằng Index

```typescript
// Tìm người có email là 'a@example.com'
// (Nhanh hơn rât nhiều so với lấy tất cả rồi filter)
const user = await db.getFromIndex("users", "by-email", "a@example.com");
```

### Tìm theo phạm vi (Range) - "Magic" của IDB 🎩

Bạn muốn tìm user từ 20 đến 30 tuổi?

```typescript
// IDBKeyRange.bound(lower, upper)
const range = IDBKeyRange.bound(20, 30);
const youngUsers = await db.getAllFromIndex("users", "by-age", range);
```

_Các loại Range khác:_

- `IDBKeyRange.lowerBound(20)`: Từ 20 tuổi trở lên.
- `IDBKeyRange.upperBound(50)`: Từ 50 tuổi trở xuống.
- `IDBKeyRange.only(25)`: Đúng 25 tuổi.

---

## 6. Best Practices & "Bẫy" thường gặp ⚠️

1.  **Đừng chặn UI**: Dù IndexedDB là Async, nhưng nếu bạn đọc/ghi 10,000 dòng một lúc mà không chia nhỏ (batching), browser vẫn có thể bị "khựng". Hãy dùng **Cursor** để duyệt từng dòng hoặc chia nhỏ tác vụ.
2.  **Quản lý Version cẩn thận**: Khi muốn thêm Index mới hay Store mới, BẮT BUỘC phải tăng version trong `openDB`. Nếu không, code `upgrade` sẽ không bao giờ chạy.
3.  **Lưu Blob/File trực tiếp**: Đừng convert ảnh sang Base64 (String) rồi lưu, nó làm tăng 30% dung lượng và chậm. Hãy lưu thẳng `Blob` vào IndexedDB.
4.  **Error Handling**: Luôn bọc code trong `try/catch`. Ổ cứng người dùng có thể bị đầy (QuotaExceededError).

---

## 7. Tổng kết

IndexedDB là "vũ khí bí mật" cho các ứng dụng Web hiệu năng cao. Nó hơi khó lúc đầu, nhưng khi đã hiểu tư duy **Database - Store - Index**, bạn sẽ thấy nó cực kỳ mạnh mẽ.

👉 **Muốn xem code chạy thật?**
Hãy mở tab **Demo** trên menu để xem ứng dụng quản lý User và Cache ảnh thực tế nhé!
