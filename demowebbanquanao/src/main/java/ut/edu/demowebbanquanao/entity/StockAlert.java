package ut.edu.demowebbanquanao.entity;

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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity cho bảng stock_alerts - Cảnh báo tồn kho
 * Theo dõi các sản phẩm sắp hết hàng hoặc đã hết hàng
 */
@Entity
@Table(name = "stock_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Integer alertId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    private AlertType alertType;

    @Column(name = "current_stock", nullable = false)
    private Integer currentStock;

    @Column(name = "threshold_stock", nullable = false)
    private Integer thresholdStock;

    @Column(name = "suggested_order_quantity")
    private Integer suggestedOrderQuantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_status")
    private AlertStatus alertStatus = AlertStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Enum cho loại cảnh báo
     */
    public enum AlertType {
        LOW_STOCK,      // Tồn kho thấp
        OUT_OF_STOCK,   // Hết hàng
        OVERSTOCK       // Tồn kho quá nhiều
    }

    /**
     * Enum cho trạng thái cảnh báo
     */
    public enum AlertStatus {
        PENDING,        // Đang chờ xử lý
        ACKNOWLEDGED,   // Đã xác nhận
        RESOLVED        // Đã giải quyết
    }
}