package ut.edu.demowebbanquanao.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "purchase_order_details")
public class PurchaseOrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "po_detail_id")
    private Integer poDetailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "received_quantity")
    private Integer receivedQuantity = 0;

    @Column(name = "expected_receive_date")
    private LocalDate expectedReceiveDate;

    @Column(name = "actual_receive_date")
    private LocalDate actualReceiveDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "quality_check_status")
    private QualityCheckStatus qualityCheckStatus = QualityCheckStatus.PENDING;

    @Column(name = "rejected_quantity")
    private Integer rejectedQuantity = 0;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /**
     * Enum cho trạng thái kiểm tra chất lượng
     */
    public enum QualityCheckStatus {
        PENDING,    // Chờ kiểm tra
        PASSED,     // Đạt chất lượng
        FAILED,     // Không đạt
        PARTIAL     // Một phần đạt
    }

    // Computed field: total_price = quantity * unit_price
    public BigDecimal getTotalPrice() {
        if (quantity != null && unitPrice != null) {
            return unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
        return BigDecimal.ZERO;
    }

    /**
     * Tính số lượng được chấp nhận (received - rejected)
     */
    public Integer getAcceptedQuantity() {
        if (receivedQuantity != null && rejectedQuantity != null) {
            return receivedQuantity - rejectedQuantity;
        }
        return receivedQuantity != null ? receivedQuantity : 0;
    }

    /**
     * Kiểm tra xem đã nhận đủ hàng chưa
     */
    public boolean isFullyReceived() {
        return receivedQuantity != null && quantity != null &&
               receivedQuantity.equals(quantity);
    }

    /**
     * Kiểm tra xem có hàng bị từ chối không
     */
    public boolean hasRejectedItems() {
        return rejectedQuantity != null && rejectedQuantity > 0;
    }
}