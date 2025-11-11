# Hướng Dẫn Cài Đặt Website Settings

## Vấn Đề Đã Giải Quyết

Trước đây, màu sắc và cài đặt website chỉ được lưu trong **localStorage** của trình duyệt. Điều này có nghĩa là:
- ❌ Mỗi trình duyệt có cài đặt riêng
- ❌ Không đồng bộ giữa các thiết bị
- ❌ Mất cài đặt khi xóa cache trình duyệt

## Giải Pháp Mới

Bây giờ cài đặt được lưu vào **database** và đồng bộ tự động:
- ✅ Đồng bộ giữa tất cả trình duyệt
- ✅ Đồng bộ giữa tất cả thiết bị
- ✅ Không mất dữ liệu khi xóa cache
- ✅ Có backup trong database

## Cách Cài Đặt

### Bước 1: Chạy Migration SQL

Chạy file SQL để tạo bảng `website_settings`:

```bash
# Từ thư mục demowebbanquanao
mysql -u root -p your_database_name < src/main/resources/create_website_settings_table.sql
```

Hoặc copy nội dung file `create_website_settings_table.sql` và chạy trực tiếp trong MySQL Workbench/phpMyAdmin.

### Bước 2: Khởi Động Lại Backend

```bash
cd demowebbanquanao
./mvnw spring-boot:run
```

### Bước 3: Khởi Động Frontend

```bash
cd fashion-store-frontend
npm run dev
```

### Bước 4: Kiểm Tra

1. Mở trình duyệt và truy cập: `http://localhost:3000/admin/settings`
2. Thay đổi màu sắc trong tab "Giao Diện"
3. Click "Lưu Thay Đổi"
4. Mở trình duyệt khác (Chrome, Firefox, Edge, v.v.)
5. Truy cập cùng URL: `http://localhost:3000`
6. ✅ Màu sắc đã được áp dụng trên tất cả trình duyệt!

## API Endpoints

### GET /api/settings
Lấy tất cả cài đặt website

**Response:**
```json
{
  "siteName": "Fashion Store",
  "siteDescription": "Cửa hàng thời trang trực tuyến",
  "logoUrl": "",
  "faviconUrl": "",
  "contactEmail": "contact@fashionstore.com",
  "contactPhone": "0123456789",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "primaryColor": "#6366f1",
  "secondaryColor": "#ec4899"
}
```

### PUT /api/settings
Cập nhật tất cả cài đặt

**Request Body:**
```json
{
  "siteName": "My Fashion Store",
  "primaryColor": "#ff0000",
  "secondaryColor": "#00ff00"
}
```

### POST /api/settings/reset
Reset về cài đặt mặc định

### GET /api/settings/{key}
Lấy một setting cụ thể

**Example:** `GET /api/settings/primaryColor`

### PATCH /api/settings/{key}
Cập nhật một setting cụ thể

**Request Body:**
```json
{
  "value": "#ff0000"
}
```

## Cách Hoạt Động

1. **Khi trang web load:**
   - Frontend đọc cài đặt từ localStorage (nhanh)
   - Đồng thời gọi API để lấy cài đặt mới nhất từ server
   - Nếu có cài đặt mới từ server, tự động cập nhật

2. **Khi admin thay đổi cài đặt:**
   - Lưu vào database qua API
   - Cập nhật localStorage
   - Áp dụng CSS variables ngay lập tức

3. **Khi mở trình duyệt khác:**
   - Tự động lấy cài đặt từ database
   - Áp dụng màu sắc đã lưu

## Lưu Ý

- Cài đặt được lưu dưới dạng JSON trong database
- Mỗi lần thay đổi đều được ghi log với timestamp
- Có thể dễ dàng backup/restore từ database
- LocalStorage vẫn được sử dụng để tăng tốc độ load trang

## Troubleshooting

### Màu sắc không đồng bộ?
1. Kiểm tra backend có chạy không: `http://localhost:8080/api/settings`
2. Kiểm tra console browser có lỗi API không
3. Xóa localStorage và reload: `localStorage.clear()`

### Lỗi khi lưu cài đặt?
1. Kiểm tra database đã có bảng `website_settings` chưa
2. Kiểm tra backend logs có lỗi không
3. Kiểm tra CORS settings trong backend

### Reset về mặc định
Gọi API: `POST http://localhost:8080/api/settings/reset`

Hoặc xóa record trong database:
```sql
DELETE FROM website_settings WHERE setting_key = 'website_settings';
```

## Kết Luận

Giờ đây màu sắc và cài đặt website của bạn đã được đồng bộ hoàn toàn giữa tất cả trình duyệt và thiết bị! 🎉