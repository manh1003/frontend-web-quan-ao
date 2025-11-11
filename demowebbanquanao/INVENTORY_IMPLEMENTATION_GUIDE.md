# 📋 HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG QUẢN LÝ KHO

## ✅ ĐÃ HOÀN THÀNH

### 1. Database Migration
- ✅ File: `src/main/resources/inventory_management_migration.sql`
- ✅ Bao gồm:
  - 3 bảng mới: `stock_alerts`, `reorder_suggestions`, `stock_forecast`
  - Cập nhật bảng `purchase_orders` và `purchase_order_details`
  - 3 Stored Procedures
  - 2 Triggers tự động
  - 3 Views hỗ trợ báo cáo

### 2. Entity Classes
- ✅ `StockAlert.java` - Cảnh báo tồn kho
- ✅ `ReorderSuggestion.java` - Đề xuất nhập hàng
- ✅ `StockForecast.java` - Dự báo tồn kho
- ✅ Cập nhật `PurchaseOrder.java`
- ✅ Cập nhật `PurchaseOrderDetail.java`

### 3. Repository Interfaces
- ✅ `StockAlertRepository.java`
- ✅ `ReorderSuggestionRepository.java`
- ✅ `StockForecastRepository.java`

---

## 🔄 CẦN THỰC HIỆN TIẾP

### Bước 1: Chạy Migration SQL

```bash
# Kết nối MySQL
mysql -u root -p fashion_store

# Chạy migration
source src/main/resources/inventory_management_migration.sql
```

**Lưu ý quan trọng:**
- ⚠️ Backup database trước khi chạy migration
- ⚠️ Kiểm tra kỹ các ALTER TABLE statements
- ⚠️ Test trên môi trường dev trước

### Bước 2: Tạo DTO Classes

Cần tạo các file DTO sau trong `src/main/java/ut/edu/demowebbanquanao/dto/`:

#### 2.1. StockAlertDTO.java
```java
package ut.edu.demowebbanquanao.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class StockAlertDTO {
    private Integer alertId;
    private Integer variantId;
    private String productName;
    private String color;
    private String size;
    private String alertType;
    private Integer currentStock;
    private Integer thresholdStock;
    private Integer suggestedOrderQuantity;
    private String alertStatus;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String resolvedByName;
    private String notes;
}
```

#### 2.2. ReorderSuggestionDTO.java
```java
package ut.edu.demowebbanquanao.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ReorderSuggestionDTO {
    private Integer suggestionId;
    private Integer variantId;
    private String productName;
    private String color;
    private String size;
    private Integer supplierId;
    private String supplierName;
    private Integer currentStock;
    private Integer minStock;
    private BigDecimal avgDailySales;
    private Integer suggestedQuantity;
    private BigDecimal suggestedUnitPrice;
    private BigDecimal totalValue;
    private Integer leadTimeDays;
    private String priority;
    private String status;
    private Integer poId;
    private String poNumber;
    private LocalDateTime createdAt;
    private String notes;
}
```

#### 2.3. StockForecastDTO.java
```java
package ut.edu.demowebbanquanao.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class StockForecastDTO {
    private Integer forecastId;
    private Integer variantId;
    private String productName;
    private String color;
    private String size;
    private LocalDate forecastDate;
    private Integer predictedStock;
    private Integer predictedSales;
    private BigDecimal confidenceLevel;
    private Long daysUntilForecast;
}
```

### Bước 3: Tạo Service Classes

Cần tạo các service sau trong `src/main/java/ut/edu/demowebbanquanao/service/`:

#### 3.1. StockAlertService.java
```java
@Service
public class StockAlertService {
    // Các method:
    // - getAllAlerts()
    // - getPendingAlerts()
    // - getAlertsByStatus(status)
    // - acknowledgeAlert(id, notes)
    // - resolveAlert(id)
    // - generateAlerts() - gọi stored procedure
}
```

#### 3.2. ReorderSuggestionService.java
```java
@Service
public class ReorderSuggestionService {
    // Các method:
    // - getAllSuggestions()
    // - getPendingSuggestions()
    // - getSuggestionsByPriority()
    // - approveSuggestion(id)
    // - rejectSuggestion(id, reason)
    // - createPOFromSuggestion(id) - gọi stored procedure
    // - generateSuggestions() - gọi stored procedure
}
```

#### 3.3. StockForecastService.java
```java
@Service
public class StockForecastService {
    // Các method:
    // - getForecastByVariant(variantId, days)
    // - getLowStockForecasts()
    // - generateForecast(variantId) - logic dự báo
}
```

### Bước 4: Tạo Controller Classes

Cần tạo các controller sau trong `src/main/java/ut/edu/demowebbanquanao/controller/`:

#### 4.1. StockAlertController.java
```java
@RestController
@RequestMapping("/api/stock-alerts")
public class StockAlertController {
    
    @GetMapping
    public ResponseEntity<List<StockAlertDTO>> getAllAlerts();
    
    @GetMapping("/pending")
    public ResponseEntity<List<StockAlertDTO>> getPendingAlerts();
    
    @PostMapping("/generate")
    public ResponseEntity<String> generateAlerts();
    
    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<Void> acknowledgeAlert(@PathVariable Integer id);
    
    @PutMapping("/{id}/resolve")
    public ResponseEntity<Void> resolveAlert(@PathVariable Integer id);
}
```

#### 4.2. ReorderSuggestionController.java
```java
@RestController
@RequestMapping("/api/reorder-suggestions")
public class ReorderSuggestionController {
    
    @GetMapping
    public ResponseEntity<List<ReorderSuggestionDTO>> getAllSuggestions();
    
    @GetMapping("/pending")
    public ResponseEntity<List<ReorderSuggestionDTO>> getPendingSuggestions();
    
    @PostMapping("/generate")
    public ResponseEntity<String> generateSuggestions();
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approveSuggestion(@PathVariable Integer id);
    
    @PostMapping("/{id}/create-po")
    public ResponseEntity<PurchaseOrderDTO> createPOFromSuggestion(@PathVariable Integer id);
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<Void> rejectSuggestion(@PathVariable Integer id);
}
```

#### 4.3. StockForecastController.java
```java
@RestController
@RequestMapping("/api/stock-forecast")
public class StockForecastController {
    
    @GetMapping("/variant/{variantId}")
    public ResponseEntity<List<StockForecastDTO>> getForecastByVariant(
        @PathVariable Integer variantId,
        @RequestParam(defaultValue = "30") Integer days
    );
    
    @GetMapping("/low-stock")
    public ResponseEntity<List<StockForecastDTO>> getLowStockForecasts();
}
```

### Bước 5: Cập nhật PurchaseOrderService

Cần cập nhật `PurchaseOrderService.java` để:
- Xử lý các trường mới (approvedBy, receivedBy, etc.)
- Tích hợp với ReorderSuggestion
- Trigger tự động cập nhật stock khi status = RECEIVED

### Bước 6: Setup Scheduled Jobs

Tạo file `InventoryScheduledTasks.java`:

```java
@Component
public class InventoryScheduledTasks {
    
    @Autowired
    private StockAlertService stockAlertService;
    
    @Autowired
    private ReorderSuggestionService reorderSuggestionService;
    
    // Chạy mỗi ngày lúc 1:00 AM
    @Scheduled(cron = "0 0 1 * * *")
    public void generateDailyAlerts() {
        stockAlertService.generateAlerts();
    }
    
    // Chạy mỗi ngày lúc 2:00 AM
    @Scheduled(cron = "0 0 2 * * *")
    public void generateDailySuggestions() {
        reorderSuggestionService.generateSuggestions();
    }
}
```

Thêm vào `application.properties`:
```properties
spring.task.scheduling.enabled=true
```

### Bước 7: Frontend Implementation

#### 7.1. Tạo API Client (TypeScript)

File: `fashion-store-frontend/src/api/inventory.ts`

```typescript
export const inventoryApi = {
  // Stock Alerts
  getStockAlerts: () => api.get('/stock-alerts'),
  getPendingAlerts: () => api.get('/stock-alerts/pending'),
  acknowledgeAlert: (id: number) => api.put(`/stock-alerts/${id}/acknowledge`),
  resolveAlert: (id: number) => api.put(`/stock-alerts/${id}/resolve`),
  
  // Reorder Suggestions
  getReorderSuggestions: () => api.get('/reorder-suggestions'),
  getPendingSuggestions: () => api.get('/reorder-suggestions/pending'),
  approveSuggestion: (id: number) => api.put(`/reorder-suggestions/${id}/approve`),
  rejectSuggestion: (id: number) => api.put(`/reorder-suggestions/${id}/reject`),
  createPOFromSuggestion: (id: number) => api.post(`/reorder-suggestions/${id}/create-po`),
  
  // Stock Forecast
  getForecastByVariant: (variantId: number, days: number = 30) => 
    api.get(`/stock-forecast/variant/${variantId}?days=${days}`),
  getLowStockForecasts: () => api.get('/stock-forecast/low-stock'),
};
```

#### 7.2. Tạo Pages

Cần tạo các trang sau trong `fashion-store-frontend/src/pages/admin/`:

1. **StockAlertsPage.tsx** - Hiển thị cảnh báo tồn kho
2. **ReorderSuggestionsPage.tsx** - Quản lý đề xuất nhập hàng
3. **InventoryDashboardPage.tsx** - Dashboard tổng quan với charts

#### 7.3. Cập nhật Navigation

Thêm vào menu admin:
```typescript
{
  name: 'Quản lý tồn kho',
  children: [
    { name: 'Cảnh báo tồn kho', path: '/admin/stock-alerts' },
    { name: 'Đề xuất nhập hàng', path: '/admin/reorder-suggestions' },
    { name: 'Dashboard tồn kho', path: '/admin/inventory-dashboard' },
  ]
}
```

---

## 🧪 TESTING

### Unit Tests

Tạo test files:
- `StockAlertServiceTest.java`
- `ReorderSuggestionServiceTest.java`
- `StockForecastServiceTest.java`

### Integration Tests

Test các stored procedures:
```sql
-- Test generate alerts
CALL check_and_create_stock_alerts();

-- Test generate suggestions
CALL generate_reorder_suggestions();

-- Test create PO from suggestion
CALL create_po_from_suggestion(1, 1);
```

### Manual Testing Checklist

- [ ] Tạo cảnh báo khi stock < threshold
- [ ] Tạo đề xuất nhập hàng tự động
- [ ] Phê duyệt đề xuất
- [ ] Tạo PO từ đề xuất
- [ ] Nhận hàng và kiểm tra trigger tự động
- [ ] Xem báo cáo và dashboard

---

## 📊 MONITORING & MAINTENANCE

### Scheduled Jobs Monitor

Kiểm tra logs của scheduled tasks:
```bash
tail -f logs/application.log | grep "InventoryScheduledTasks"
```

### Database Maintenance

Chạy định kỳ (hàng tháng):
```sql
-- Xóa cảnh báo đã giải quyết cũ
DELETE FROM stock_alerts 
WHERE alert_status = 'RESOLVED' 
AND resolved_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Xóa đề xuất bị từ chối cũ
DELETE FROM reorder_suggestions 
WHERE status = 'REJECTED' 
AND updated_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Xóa dự báo cũ
DELETE FROM stock_forecast 
WHERE forecast_date < DATE_SUB(CURDATE(), INTERVAL 90 DAY);
```

---

## 🔐 SECURITY & PERMISSIONS

Cấu hình quyền trong database:

```sql
-- Quyền xem cảnh báo
INSERT INTO permissions (permission_name, description, module) 
VALUES ('VIEW_STOCK_ALERTS', 'Xem cảnh báo tồn kho', 'INVENTORY');

-- Quyền quản lý đề xuất
INSERT INTO permissions (permission_name, description, module) 
VALUES ('MANAGE_REORDER_SUGGESTIONS', 'Quản lý đề xuất nhập hàng', 'INVENTORY');

-- Gán quyền cho role WAREHOUSE
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'WAREHOUSE' 
AND p.module = 'INVENTORY';
```

---

## 📈 PERFORMANCE OPTIMIZATION

### Indexes

Các indexes đã được tạo trong migration:
- `idx_status` trên stock_alerts
- `idx_priority` trên reorder_suggestions
- `idx_forecast_date` trên stock_forecast

### Caching

Cân nhắc cache cho:
- Pending alerts count
- Pending suggestions count
- Dashboard statistics

```java
@Cacheable("pendingAlertsCount")
public long getPendingAlertsCount() {
    return stockAlertRepository.countPendingAlerts();
}
```

---

## 🎯 NEXT STEPS

1. ✅ Chạy migration SQL
2. ⏳ Tạo DTO classes
3. ⏳ Tạo Service classes
4. ⏳ Tạo Controller classes
5. ⏳ Setup scheduled jobs
6. ⏳ Implement frontend
7. ⏳ Testing
8. ⏳ Deploy to production

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, kiểm tra:
1. Logs: `logs/application.log`
2. Database errors: `SHOW ENGINE INNODB STATUS;`
3. Trigger status: `SHOW TRIGGERS;`
4. Procedure status: `SHOW PROCEDURE STATUS WHERE Db = 'fashion_store';`

---

**Lưu ý:** Đây là hệ thống phức tạp, nên triển khai từng phần và test kỹ trước khi đưa vào production.