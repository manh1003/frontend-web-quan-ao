package ut.edu.demowebbanquanao.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
 * Entity cho bảng stock_forecast - Dự báo tồn kho
 * Dự đoán nhu cầu và tồn kho trong tương lai
 */
@Entity
@Table(name = "stock_forecast")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockForecast {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "forecast_id")
    private Integer forecastId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;

    @Column(name = "predicted_stock", nullable = false)
    private Integer predictedStock;

    @Column(name = "predicted_sales", nullable = false)
    private Integer predictedSales;

    @Column(name = "confidence_level", precision = 5, scale = 2)
    private BigDecimal confidenceLevel;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Kiểm tra xem dự báo có độ tin cậy cao không (>= 80%)
     */
    public boolean isHighConfidence() {
        return confidenceLevel != null && 
               confidenceLevel.compareTo(BigDecimal.valueOf(80)) >= 0;
    }

    /**
     * Kiểm tra xem tồn kho dự báo có thấp không
     */
    public boolean isPredictedLowStock(Integer minThreshold) {
        return predictedStock != null && 
               minThreshold != null && 
               predictedStock <= minThreshold;
    }

    /**
     * Tính số ngày còn lại đến ngày dự báo
     */
    public long getDaysUntilForecast() {
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), forecastDate);
    }
}