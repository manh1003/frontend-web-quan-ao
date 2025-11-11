# 🏭 HỆ THỐNG QUẢN LÝ TỒN KHO THÔNG MINH

## 📖 TỔNG QUAN

Hệ thống quản lý tồn kho nâng cao cho Fashion Store với các tính năng:

- ✅ **Cảnh báo tồn kho tự động** - Phát hiện sản phẩm sắp hết/đã hết hàng
- ✅ **Đề xuất nhập hàng thông minh** - Tính toán dựa trên lịch sử bán hàng
- ✅ **Dự báo tồn kho** - Dự đoán nhu cầu trong tương lai
- ✅ **Quy trình nhập hàng chặt chẽ** - Theo dõi từ đề xuất → PO → nhận hàng
- ✅ **Tự động hóa** - Triggers và stored procedures xử lý tự động

---

## 📁 CẤU TRÚC DỰ ÁN

```
demowebbanquanao/
├── src/main/resources/
│   └── inventory_management_migration.sql    # SQL migration
│
├── src/main/java/ut/edu/demowebbanquanao/
│   ├── entity/
│   │   ├── StockAlert.java                   # Entity cảnh báo
│   │   ├── ReorderSuggestion.java            # Entity đề xuất
│   │   ├── StockForecast.java                # Entity dự báo
│   │   ├── PurchaseOrder.java                # Đã cập nhật
│   │   └── PurchaseOrderDetail.java          # Đã cập nhật
│   │
│   ├── repository/
│   │   ├── StockAlertRepository.java
│   │   ├── ReorderSuggestionRepository.java
│   │   └── StockForecastRepository.java
│   │
│   ├── dto/                                   # CẦN TẠO
│   │   ├── StockAlertDTO.java
│   │   ├── ReorderSuggestionDTO.java
│   │   └── StockForecastDTO.java
│   │
│   ├── service/                               # CẦN TẠO
│   │   ├── StockAlertService.java
│   │   ├── ReorderSuggestionService.java
│   │   └── StockForecastService.java
│   │
│   └── controller/                            # CẦN TẠO
│       ├── StockAlertController.java
│       ├── ReorderSuggestionController.java
│       └── StockForecastController.java
│
├── INVENTORY_MANAGEMENT_PROPOSAL.md           # Đề xuất ban đầu
├── INVENTORY_IMPLEMENTATION_GUIDE.md          # Hướng dẫn triển khai
└── INVENTORY_SYSTEM_README.md                 # File này
```

---

## 🗄️ DATABASE SCHEMA

### Bảng Mới

#### 1. stock_alerts
Theo dõi cảnh báo tồn kho

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| alert_id | INT | Primary key |
| variant_id | INT | FK → product_variants |
| alert_type | ENUM | LOW_STOCK, OUT_OF_STOCK, OVERSTOCK |
| current_stock | INT | Tồn kho hiện tại |
| threshold_stock | INT | Ngưỡng cảnh báo |
| suggested_order_quantity | INT | Số lượng đề xuất nhập |
| alert_status | ENUM | PENDING, ACKNOWLEDGED, RESOLVED |
| created_at | TIMESTAMP | Thời gian tạo |
| resolved_at | TIMESTAMP | Thời gian giải quyết |
| resolved_by | INT | FK → users |
| notes | TEXT | Ghi chú |

#### 2. reorder_suggestions
Đề xuất nhập hàng thông minh

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| suggestion_id | INT | Primary key |
| variant_id | INT | FK → product_variants |
| supplier_id | INT | FK → suppliers |
| current_stock | INT | Tồn kho hiện tại |
| min_stock | INT | Tồn kho tối thiểu |
| avg_daily_sales | DECIMAL | Trung bình bán/ngày |
| suggested_quantity | INT | Số lượng đề xuất |
| suggested_unit_price | DECIMAL | Giá đề xuất |
| lead_time_days | INT | Thời gian giao hàng |
| priority | ENUM | LOW, MEDIUM, HIGH, URGENT |
| status | ENUM | PENDING, APPROVED, ORDERED, REJECTED |
| po_id | INT | FK → purchase_orders |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |

#### 3. stock_forecast
Dự báo tồn kho

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| forecast_id | INT | Primary key |
| variant_id | INT | FK → product_variants |
| forecast_date | DATE | Ngày dự báo |
| predicted_stock | INT | Tồn kho dự báo |
| predicted_sales | INT | Doanh số dự báo |
| confidence_level | DECIMAL | Độ tin cậy (%) |
| created_at | TIMESTAMP | Thời gian tạo |

### Cập Nhật Bảng Hiện Tại

#### purchase_orders (Thêm cột)
- `approved_by` - Người phê duyệt
- `approved_at` - Thời gian phê duyệt
- `received_by` - Người nhận hàng
- `is_auto_generated` - PO tự động từ suggestion
- `suggestion_id` - FK → reorder_suggestions

#### purchase_order_details (Thêm cột)
- `expected_receive_date` - Ngày dự kiến nhận
- `actual_receive_date` - Ngày nhận thực tế
- `quality_check_status` - Trạng thái kiểm tra chất lượng
- `rejected_quantity` - Số lượng bị từ chối
- `notes` - Ghi chú

---

## ⚙️ STORED PROCEDURES

### 1. check_and_create_stock_alerts()
Tự động tạo cảnh báo cho sản phẩm:
- Tồn kho <= ngưỡng tối thiểu → LOW_STOCK
- Tồn kho = 0 → OUT_OF_STOCK

**Chạy:** Mỗi ngày lúc 1:00 AM

### 2. generate_reorder_suggestions()
Tự động tạo đề xuất nhập hàng dựa trên:
- Tồn kho hiện tại
- Lịch sử bán hàng 30 ngày
- Ngưỡng tối thiểu
- Lead time

**Chạy:** Mỗi ngày lúc 2:00 AM

### 3. create_po_from_suggestion(suggestion_id, user_id)
Tự động tạo Purchase Order từ đề xuất đã phê duyệt

---

## 🔄 TRIGGERS

### 1. after_po_received
Khi PO status = RECEIVED:
1. Tự động tạo inventory_transactions (IN)
2. Cập nhật stock_quantity
3. Đánh dấu reorder_suggestion = ORDERED
4. Resolve các stock_alerts liên quan

### 2. after_stock_update
Khi stock_quantity giảm xuống dưới threshold:
- Tự động tạo stock_alert

---

## 📊 VIEWS

### 1. v_inventory_overview
Tổng quan tồn kho với trạng thái:
- OUT_OF_STOCK
- CRITICAL
- LOW
- NORMAL
- OVERSTOCK

### 2. v_products_need_reorder
Danh sách sản phẩm cần nhập hàng

### 3. v_inventory_movement
Lịch sử nhập xuất tồn

---

## 🔌 API ENDPOINTS

### Stock Alerts

```
GET    /api/stock-alerts              # Tất cả cảnh báo
GET    /api/stock-alerts/pending      # Cảnh báo chờ xử lý
POST   /api/stock-alerts/generate     # Tạo cảnh báo thủ công
PUT    /api/stock-alerts/{id}/acknowledge  # Xác nhận
PUT    /api/stock-alerts/{id}/resolve      # Giải quyết
```

### Reorder Suggestions

```
GET    /api/reorder-suggestions           # Tất cả đề xuất
GET    /api/reorder-suggestions/pending   # Đề xuất chờ duyệt
POST   /api/reorder-suggestions/generate  # Tạo đề xuất thủ công
PUT    /api/reorder-suggestions/{id}/approve    # Phê duyệt
PUT    /api/reorder-suggestions/{id}/reject     # Từ chối
POST   /api/reorder-suggestions/{id}/create-po  # Tạo PO
```

### Stock Forecast

```
GET    /api/stock-forecast/variant/{id}?days=30  # Dự báo theo variant
GET    /api/stock-forecast/low-stock             # Dự báo tồn thấp
```

---

## 🚀 QUY TRÌNH HOẠT ĐỘNG

### Quy Trình Tự Động (Hàng Ngày)

```
1:00 AM → check_and_create_stock_alerts()
          ↓
          Tạo cảnh báo LOW_STOCK / OUT_OF_STOCK
          ↓
2:00 AM → generate_reorder_suggestions()
          ↓
          Tạo đề xuất nhập hàng với priority
```

### Quy Trình Nhập Hàng

```
1. Nhân viên kho xem đề xuất (PENDING)
   ↓
2. Kiểm tra và phê duyệt (APPROVED)
   ↓
3. Tạo Purchase Order từ đề xuất
   ↓
4. Quản lý phê duyệt PO (APPROVED)
   ↓
5. Nhận hàng (RECEIVED)
   ↓
6. TRIGGER tự động:
   - Tạo inventory_transactions
   - Cập nhật stock_quantity
   - Đánh dấu suggestion = ORDERED
   - Resolve stock_alerts
```

---

## 💡 TÍNH NĂNG NỔI BẬT

### 1. Tự Động Hóa
- ✅ Tự động phát hiện sản phẩm sắp hết
- ✅ Tự động đề xuất số lượng cần nhập
- ✅ Tự động cập nhật tồn kho khi nhận hàng

### 2. Thông Minh
- ✅ Dựa trên lịch sử bán hàng thực tế
- ✅ Tính toán lead time và priority
- ✅ Dự báo tồn kho tương lai

### 3. Chặt Chẽ
- ✅ Theo dõi đầy đủ quy trình
- ✅ Ghi nhận người phê duyệt, người nhận hàng
- ✅ Kiểm tra chất lượng hàng nhập

### 4. Tích Hợp
- ✅ Liên kết chặt chẽ PO ↔ Inventory Transaction
- ✅ Liên kết với nhà cung cấp và lịch sử giá
- ✅ Tích hợp với hệ thống bán hàng

---

## 📈 METRICS & KPIs

### Dashboard Metrics

1. **Cảnh báo tồn kho**
   - Số cảnh báo PENDING
   - Số cảnh báo URGENT
   - Thời gian giải quyết trung bình

2. **Đề xuất nhập hàng**
   - Số đề xuất PENDING
   - Tổng giá trị đề xuất
   - Tỷ lệ phê duyệt

3. **Hiệu suất nhập hàng**
   - Thời gian từ đề xuất → PO
   - Thời gian từ PO → nhận hàng
   - Tỷ lệ hàng đạt chất lượng

---

## 🔒 BẢO MẬT & PHÂN QUYỀN

### Permissions

```sql
-- Xem cảnh báo
VIEW_STOCK_ALERTS

-- Quản lý đề xuất
MANAGE_REORDER_SUGGESTIONS

-- Phê duyệt PO
APPROVE_PURCHASE_ORDERS

-- Nhận hàng
RECEIVE_GOODS
```

### Roles

- **WAREHOUSE** - Xem cảnh báo, tạo đề xuất
- **MANAGER** - Phê duyệt đề xuất, phê duyệt PO
- **ADMIN** - Full access

---

## 🛠️ MAINTENANCE

### Daily Tasks (Automated)
- ✅ Generate stock alerts
- ✅ Generate reorder suggestions

### Weekly Tasks
- 📊 Review pending suggestions
- 📊 Check forecast accuracy

### Monthly Tasks
- 🗑️ Clean up old resolved alerts (>30 days)
- 🗑️ Clean up old rejected suggestions (>90 days)
- 🗑️ Clean up old forecasts (>90 days)

---

## 📚 TÀI LIỆU LIÊN QUAN

1. **INVENTORY_MANAGEMENT_PROPOSAL.md** - Đề xuất chi tiết ban đầu
2. **INVENTORY_IMPLEMENTATION_GUIDE.md** - Hướng dẫn triển khai từng bước
3. **inventory_management_migration.sql** - SQL migration script

---

## 🎯 ROADMAP

### Phase 1 (Completed) ✅
- Database schema
- Entity classes
- Repository interfaces

### Phase 2 (In Progress) 🔄
- DTO classes
- Service classes
- Controller classes

### Phase 3 (Planned) 📋
- Frontend implementation
- Dashboard với charts
- Mobile responsive

### Phase 4 (Future) 🚀
- Machine Learning cho dự báo
- Integration với ERP
- Multi-warehouse support

---

## 📞 SUPPORT

Nếu gặp vấn đề:

1. Kiểm tra logs: `logs/application.log`
2. Kiểm tra database: `SHOW ENGINE INNODB STATUS;`
3. Kiểm tra triggers: `SHOW TRIGGERS;`
4. Kiểm tra procedures: `SHOW PROCEDURE STATUS;`

---

## 📝 CHANGELOG

### Version 1.0.0 (2025-01-23)
- ✅ Initial release
- ✅ Stock alerts system
- ✅ Reorder suggestions
- ✅ Stock forecast
- ✅ Automated triggers and procedures

---

**Developed with ❤️ for Fashion Store**