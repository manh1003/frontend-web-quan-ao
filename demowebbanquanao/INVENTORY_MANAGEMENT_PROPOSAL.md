# ĐỀ XUẤT QUY TRÌNH QUẢN LÝ TỒN KHO LOGIC VÀ CHẶT CHẼ

## 📊 PHÂN TÍCH HỆ THỐNG HIỆN TẠI

### Các Bảng Liên Quan
1. **suppliers** - Nhà cung cấp
2. **purchase_orders** - Đơn nhập hàng
3. **purchase_order_details** - Chi tiết đơn nhập
4. **product_variants** - Biến thể sản phẩm (có `stock_quantity`, `min_stock_threshold`)
5. **inventory_transactions** - Giao dịch tồn kho (IN/OUT/ADJUSTMENT)
6. **orders** - Đơn bán hàng
7. **order_details** - Chi tiết đơn bán

### Vấn Đề Hiện Tại

#### 1. **Thiếu Cơ Chế Đề Xuất Nhập Hàng Tự Động**
- ❌ Không có bảng hoặc logic để theo dõi sản phẩm sắp hết hàng
- ❌ Không có cảnh báo khi `stock_quantity` < `min_stock_threshold`
- ❌ Không có đề xuất số lượng cần nhập dựa trên lịch sử bán

#### 2. **Quy Trình Nhập Hàng Chưa Chặt Chẽ**
- ❌ Khi tạo PO, tồn kho chưa được reserve (đặt trước)
- ❌ Khi PO được APPROVED, hàng chưa về nhưng không có cơ chế theo dõi
- ❌ Khi PO RECEIVED, phải cập nhật thủ công `received_quantity` và tạo inventory transaction

#### 3. **Thiếu Liên Kết Giữa PO và Inventory Transaction**
- ❌ Khi nhận hàng (PO RECEIVED), phải tự tạo inventory transaction
- ❌ Không có trigger tự động cập nhật stock khi PO status thay đổi

#### 4. **Thiếu Báo Cáo và Phân Tích**
- ❌ Không có báo cáo sản phẩm bán chạy để đề xuất nhập
- ❌ Không có báo cáo tồn kho theo thời gian thực
- ❌ Không có dự báo nhu cầu nhập hàng

---

## 🎯 ĐỀ XUẤT GIẢI PHÁP

### GIAI ĐOẠN 1: BỔ SUNG BẢNG VÀ LOGIC CƠ BẢN

#### 1.1. Tạo Bảng `stock_alerts` - Cảnh Báo Tồn Kho

```sql
CREATE TABLE stock_alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    variant_id INT NOT NULL,
    alert_type ENUM('LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK') NOT NULL,
    current_stock INT NOT NULL,
    threshold_stock INT NOT NULL,
    suggested_order_quantity INT,
    alert_status ENUM('PENDING', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolved_by INT NULL,
    notes TEXT,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id),
    FOREIGN KEY (resolved_by) REFERENCES users(user_id),
    INDEX idx_status (alert_status),
    INDEX idx_variant (variant_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 1.2. Tạo Bảng `reorder_suggestions` - Đề Xuất Nhập Hàng

```sql
CREATE TABLE reorder_suggestions (
    suggestion_id INT PRIMARY KEY AUTO_INCREMENT,
    variant_id INT NOT NULL,
    supplier_id INT,
    current_stock INT NOT NULL,
    min_stock INT NOT NULL,
    avg_daily_sales DECIMAL(10,2),
    suggested_quantity INT NOT NULL,
    suggested_unit_price DECIMAL(12,2),
    lead_time_days INT DEFAULT 7,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    status ENUM('PENDING', 'APPROVED', 'ORDERED', 'REJECTED') DEFAULT 'PENDING',
    po_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    notes TEXT,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_variant (variant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 1.3. Tạo Bảng `stock_forecast` - Dự Báo Tồn Kho

```sql
CREATE TABLE stock_forecast (
    forecast_id INT PRIMARY KEY AUTO_INCREMENT,
    variant_id INT NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_stock INT NOT NULL,
    predicted_sales INT NOT NULL,
    confidence_level DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id),
    UNIQUE KEY unique_variant_date (variant_id, forecast_date),
    INDEX idx_forecast_date (forecast_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### GIAI ĐOẠN 2: CẢI THIỆN QUY TRÌNH NHẬP HÀNG

#### 2.1. Thêm Cột Vào Bảng `purchase_orders`

```sql
ALTER TABLE purchase_orders 
ADD COLUMN approved_by INT NULL AFTER created_by,
ADD COLUMN approved_at TIMESTAMP NULL AFTER approved_by,
ADD COLUMN received_by INT NULL AFTER approved_at,
ADD COLUMN is_auto_generated BOOLEAN DEFAULT FALSE AFTER received_by,
ADD COLUMN suggestion_id INT NULL AFTER is_auto_generated,
ADD FOREIGN KEY (approved_by) REFERENCES users(user_id),
ADD FOREIGN KEY (received_by) REFERENCES users(user_id),
ADD FOREIGN KEY (suggestion_id) REFERENCES reorder_suggestions(suggestion_id);
```

#### 2.2. Thêm Cột Vào Bảng `purchase_order_details`

```sql
ALTER TABLE purchase_order_details
ADD COLUMN expected_receive_date DATE NULL AFTER received_quantity,
ADD COLUMN actual_receive_date DATE NULL AFTER expected_receive_date,
ADD COLUMN quality_check_status ENUM('PENDING', 'PASSED', 'FAILED', 'PARTIAL') DEFAULT 'PENDING' AFTER actual_receive_date,
ADD COLUMN rejected_quantity INT DEFAULT 0 AFTER quality_check_status,
ADD COLUMN notes TEXT AFTER rejected_quantity;
```

---

### GIAI ĐOẠN 3: STORED PROCEDURES VÀ TRIGGERS

#### 3.1. Stored Procedure: Tự Động Tạo Cảnh Báo Tồn Kho

```sql
DELIMITER //

CREATE PROCEDURE check_and_create_stock_alerts()
BEGIN
    -- Tạo cảnh báo LOW_STOCK
    INSERT INTO stock_alerts (variant_id, alert_type, current_stock, threshold_stock, suggested_order_quantity, alert_status)
    SELECT 
        pv.variant_id,
        'LOW_STOCK',
        pv.stock_quantity,
        pv.min_stock_threshold,
        GREATEST(pv.min_stock_threshold * 2 - pv.stock_quantity, pv.min_stock_threshold),
        'PENDING'
    FROM product_variants pv
    WHERE pv.stock_quantity <= pv.min_stock_threshold
    AND pv.stock_quantity > 0
    AND pv.is_active = TRUE
    AND NOT EXISTS (
        SELECT 1 FROM stock_alerts sa 
        WHERE sa.variant_id = pv.variant_id 
        AND sa.alert_status = 'PENDING'
        AND sa.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    );
    
    -- Tạo cảnh báo OUT_OF_STOCK
    INSERT INTO stock_alerts (variant_id, alert_type, current_stock, threshold_stock, suggested_order_quantity, alert_status)
    SELECT 
        pv.variant_id,
        'OUT_OF_STOCK',
        pv.stock_quantity,
        pv.min_stock_threshold,
        pv.min_stock_threshold * 3,
        'PENDING'
    FROM product_variants pv
    WHERE pv.stock_quantity <= 0
    AND pv.is_active = TRUE
    AND NOT EXISTS (
        SELECT 1 FROM stock_alerts sa 
        WHERE sa.variant_id = pv.variant_id 
        AND sa.alert_status = 'PENDING'
        AND sa.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    );
END //

DELIMITER ;
```

#### 3.2. Stored Procedure: Tạo Đề Xuất Nhập Hàng Thông Minh

```sql
DELIMITER //

CREATE PROCEDURE generate_reorder_suggestions()
BEGIN
    INSERT INTO reorder_suggestions (
        variant_id, 
        supplier_id,
        current_stock, 
        min_stock, 
        avg_daily_sales,
        suggested_quantity, 
        suggested_unit_price,
        priority,
        status,
        created_by
    )
    SELECT 
        pv.variant_id,
        (SELECT po.supplier_id 
         FROM purchase_orders po
         JOIN purchase_order_details pod ON po.po_id = pod.po_id
         WHERE pod.variant_id = pv.variant_id
         AND po.status = 'RECEIVED'
         ORDER BY po.received_date DESC
         LIMIT 1) as supplier_id,
        pv.stock_quantity as current_stock,
        pv.min_stock_threshold as min_stock,
        COALESCE(
            (SELECT ABS(SUM(it.quantity)) / 30.0
             FROM inventory_transactions it
             WHERE it.variant_id = pv.variant_id
             AND it.transaction_type = 'OUT'
             AND it.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)),
            1
        ) as avg_daily_sales,
        GREATEST(
            (pv.min_stock_threshold * 2) - pv.stock_quantity,
            CEILING(COALESCE(
                (SELECT ABS(SUM(it.quantity)) / 30.0 * 14
                 FROM inventory_transactions it
                 WHERE it.variant_id = pv.variant_id
                 AND it.transaction_type = 'OUT'
                 AND it.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)),
                pv.min_stock_threshold
            ))
        ) as suggested_quantity,
        COALESCE(pv.cost_price, pv.retail_price * 0.6) as suggested_unit_price,
        CASE 
            WHEN pv.stock_quantity <= 0 THEN 'URGENT'
            WHEN pv.stock_quantity <= pv.min_stock_threshold * 0.5 THEN 'HIGH'
            WHEN pv.stock_quantity <= pv.min_stock_threshold THEN 'MEDIUM'
            ELSE 'LOW'
        END as priority,
        'PENDING' as status,
        1 as created_by
    FROM product_variants pv
    WHERE pv.stock_quantity <= pv.min_stock_threshold
    AND pv.is_active = TRUE
    AND NOT EXISTS (
        SELECT 1 FROM reorder_suggestions rs
        WHERE rs.variant_id = pv.variant_id
        AND rs.status IN ('PENDING', 'APPROVED', 'ORDERED')
    )
    AND NOT EXISTS (
        SELECT 1 FROM purchase_order_details pod
        JOIN purchase_orders po ON pod.po_id = po.po_id
        WHERE pod.variant_id = pv.variant_id
        AND po.status IN ('PENDING', 'APPROVED')
    );
END //

DELIMITER ;
```

#### 3.3. Trigger: Tự Động Cập Nhật Tồn Kho Khi Nhận Hàng

```sql
DELIMITER //

CREATE TRIGGER after_po_received
AFTER UPDATE ON purchase_orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'RECEIVED' AND OLD.status != 'RECEIVED' THEN
        -- Tự động tạo inventory transactions cho tất cả items trong PO
        INSERT INTO inventory_transactions (
            variant_id,
            transaction_type,
            quantity,
            reference_type,
            reference_id,
            notes,
            created_by
        )
        SELECT 
            pod.variant_id,
            'IN',
            pod.quantity,
            'purchase_order',
            NEW.po_id,
            CONCAT('Nhập hàng từ PO: ', NEW.po_number),
            NEW.received_by
        FROM purchase_order_details pod
        WHERE pod.po_id = NEW.po_id
        AND NOT EXISTS (
            SELECT 1 FROM inventory_transactions it
            WHERE it.reference_type = 'purchase_order'
            AND it.reference_id = NEW.po_id
            AND it.variant_id = pod.variant_id
        );
        
        -- Cập nhật stock quantity
        UPDATE product_variants pv
        JOIN purchase_order_details pod ON pv.variant_id = pod.variant_id
        SET pv.stock_quantity = pv.stock_quantity + pod.quantity
        WHERE pod.po_id = NEW.po_id;
        
        -- Đánh dấu reorder suggestion là ORDERED nếu có
        UPDATE reorder_suggestions
        SET status = 'ORDERED', po_id = NEW.po_id
        WHERE suggestion_id = NEW.suggestion_id
        AND status = 'APPROVED';
    END IF;
END //

DELIMITER ;
```

---

### GIAI ĐOẠN 4: API ENDPOINTS MỚI

#### 4.1. Stock Alerts API

```java
// StockAlertController.java
@RestController
@RequestMapping("/api/stock-alerts")
public class StockAlertController {
    
    @GetMapping
    public List<StockAlertDTO> getAllAlerts(@RequestParam(required = false) String status);
    
    @GetMapping("/pending")
    public List<StockAlertDTO> getPendingAlerts();
    
    @PostMapping("/generate")
    public void generateAlerts();
    
    @PutMapping("/{id}/acknowledge")
    public void acknowledgeAlert(@PathVariable Integer id, @RequestBody Map<String, String> notes);
    
    @PutMapping("/{id}/resolve")
    public void resolveAlert(@PathVariable Integer id);
}
```

#### 4.2. Reorder Suggestions API

```java
// ReorderSuggestionController.java
@RestController
@RequestMapping("/api/reorder-suggestions")
public class ReorderSuggestionController {
    
    @GetMapping
    public List<ReorderSuggestionDTO> getAllSuggestions(@RequestParam(required = false) String status);
    
    @GetMapping("/pending")
    public List<ReorderSuggestionDTO> getPendingSuggestions();
    
    @PostMapping("/generate")
    public void generateSuggestions();
    
    @PutMapping("/{id}/approve")
    public void approveSuggestion(@PathVariable Integer id);
    
    @PostMapping("/{id}/create-po")
    public PurchaseOrderDTO createPOFromSuggestion(@PathVariable Integer id);
    
    @PutMapping("/{id}/reject")
    public void rejectSuggestion(@PathVariable Integer id, @RequestBody Map<String, String> reason);
}
```

#### 4.3. Enhanced Inventory API

```java
// InventoryController.java - Thêm endpoints
@GetMapping("/low-stock")
public List<ProductVariantDTO> getLowStockVariants();

@GetMapping("/out-of-stock")
public List<ProductVariantDTO> getOutOfStockVariants();

@GetMapping("/stock-forecast/{variantId}")
public List<StockForecastDTO> getStockForecast(@PathVariable Integer variantId, @RequestParam Integer days);

@GetMapping("/dashboard")
public InventoryDashboardDTO getDashboard();
```

---

### GIAI ĐOẠN 5: QUY TRÌNH HOẠT ĐỘNG MỚI

#### Quy Trình Nhập Hàng Tự Động

```
1. HỆ THỐNG TỰ ĐỘNG (Chạy hàng ngày)
   ├─ Kiểm tra tồn kho (check_and_create_stock_alerts)
   ├─ Tạo cảnh báo LOW_STOCK / OUT_OF_STOCK
   └─ Tạo đề xuất nhập hàng (generate_reorder_suggestions)

2. NHÂN VIÊN KHO XEM ĐỀ XUẤT
   ├─ Xem danh sách reorder_suggestions (PENDING)
   ├─ Kiểm tra priority (URGENT > HIGH > MEDIUM > LOW)
   └─ Quyết định APPROVE hoặc REJECT

3. TẠO PURCHASE ORDER
   ├─ Từ suggestion đã APPROVED
   ├─ Tự động điền thông tin: supplier, quantity, price
   └─ PO status = PENDING

4. QUẢN LÝ PHÊ DUYỆT PO
   ├─ Kiểm tra ngân sách, nhà cung cấp
   ├─ Approve → PO status = APPROVED
   └─ Ghi nhận approved_by, approved_at

5. NHẬN HÀNG
   ├─ Nhân viên kho nhận hàng thực tế
   ├─ Cập nhật received_quantity, quality_check_status
   ├─ PO status = RECEIVED
   └─ TRIGGER tự động:
      ├─ Tạo inventory_transactions (IN)
      ├─ Cập nhật stock_quantity
      └─ Đánh dấu suggestion = ORDERED

6. BÁO CÁO VÀ PHÂN TÍCH
   ├─ Dashboard tồn kho real-time
   ├─ Báo cáo sản phẩm bán chạy
   └─ Dự báo nhu cầu nhập hàng
```

---

## 📈 LỢI ÍCH CỦA HỆ THỐNG MỚI

### 1. Tự Động Hóa
- ✅ Tự động phát hiện sản phẩm sắp hết
- ✅ Tự động đề xuất số lượng cần nhập
- ✅ Tự động cập nhật tồn kho khi nhận hàng

### 2. Chặt Chẽ và Minh Bạch
- ✅ Theo dõi đầy đủ quy trình từ đề xuất → PO → nhận hàng
- ✅ Ghi nhận người phê duyệt, người nhận hàng
- ✅ Kiểm tra chất lượng hàng nhập

### 3. Thông Minh
- ✅ Dựa trên lịch sử bán hàng để đề xuất
- ✅ Tính toán lead time và priority
- ✅ Dự báo tồn kho tương lai

### 4. Tích Hợp Tốt
- ✅ Liên kết chặt chẽ giữa PO và Inventory Transaction
- ✅ Liên kết với nhà cung cấp và lịch sử giá
- ✅ Tích hợp với hệ thống bán hàng

---

## 🚀 KẾ HOẠCH TRIỂN KHAI

### Phase 1 (Tuần 1-2): Cơ Sở Dữ Liệu
- [ ] Tạo các bảng mới
- [ ] Thêm cột vào bảng hiện tại
- [ ] Tạo stored procedures và triggers
- [ ] Migration dữ liệu cũ

### Phase 2 (Tuần 3-4): Backend API
- [ ] Implement StockAlertService
- [ ] Implement ReorderSuggestionService
- [ ] Enhance PurchaseOrderService
- [ ] Enhance InventoryTransactionService
- [ ] Tạo các Controller mới

### Phase 3 (Tuần 5-6): Frontend
- [ ] Trang Stock Alerts Dashboard
- [ ] Trang Reorder Suggestions
- [ ] Cải thiện trang Purchase Orders
- [ ] Trang Inventory Dashboard với charts

### Phase 4 (Tuần 7-8): Testing & Optimization
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] User acceptance testing

---

## 📝 GHI CHÚ QUAN TRỌNG

1. **Backup Database** trước khi chạy migration
2. **Test kỹ triggers** trên môi trường dev trước
3. **Scheduled Jobs**: Cần setup cron job để chạy stored procedures hàng ngày
4. **Permissions**: Cấu hình quyền cho các role (WAREHOUSE, MANAGER, ADMIN)
5. **Notifications**: Có thể thêm email/SMS alerts cho cảnh báo URGENT

---

## 🔗 TÀI LIỆU THAM KHẢO

- Schema hiện tại: `src/main/resources/schema.sql`
- Data mẫu: `src/main/resources/data.sql`
- Service hiện tại: 
  - `InventoryTransactionService.java`
  - `PurchaseOrderService.java`