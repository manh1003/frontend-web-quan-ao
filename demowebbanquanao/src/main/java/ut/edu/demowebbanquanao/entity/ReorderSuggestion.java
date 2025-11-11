package ut.edu.demowebbanquanao.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity cho bảng reorder_suggestions - Đề xuất nhập hàng
 * Tự động tính toán và đề xuất số lượng cần nhập dựa trên lịch sử bán hàng
 */
@Entity
@Table(name = "reorder_suggestions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReorderSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "suggestion_id")
    private Integer suggestionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "current_stock", nullable = false)
    private Integer currentStock;

    @Column(name = "min_stock", nullable = false)
    private Integer minStock;

    @Column(name = "avg_daily_sales", precision = 10, scale = 2)
    private BigDecimal avgDailySales;

    @Column(name = "suggested_quantity", nullable = false)
    private Integer suggestedQuantity;

    @Column(name = "suggested_unit_price", precision = 12, scale = 2)
    private BigDecimal suggestedUnitPrice;

    @Column(name = "lead_time_days")
    private Integer leadTimeDays = 7;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status = Status.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id")
    private PurchaseOrder purchaseOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Enum cho mức độ ưu tiên
     */
    public enum Priority {
        LOW,        // Ưu tiên thấp
        MEDIUM,     // Ưu tiên trung bình
        HIGH,       // Ưu tiên cao
        URGENT      // Khẩn cấp
    }

    /**
     * Enum cho trạng thái đề xuất
     */
    public enum Status {
        PENDING,    // Đang chờ xem xét
        APPROVED,   // Đã phê duyệt
        ORDERED,    // Đã tạo đơn hàng
        REJECTED    // Đã từ chối
    }

    /**
     * Tính tổng giá trị đề xuất
     */
    public BigDecimal getTotalValue() {
        if (suggestedQuantity != null && suggestedUnitPrice != null) {
            return suggestedUnitPrice.multiply(BigDecimal.valueOf(suggestedQuantity));
        }
        return BigDecimal.ZERO;
    }

    /**
     * Kiểm tra xem đề xuất có cần xử lý khẩn cấp không
     */
    public boolean isUrgent() {
        return priority == Priority.URGENT;
    }

    /**
     * Kiểm tra xem đề xuất có đang chờ xử lý không
     */
    public boolean isPending() {
        return status == Status.PENDING;
    }
}