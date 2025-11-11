package ut.edu.demowebbanquanao.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import ut.edu.demowebbanquanao.entity.StockForecast;

/**
 * Repository cho StockForecast
 * Quản lý dự báo tồn kho
 */
@Repository
public interface StockForecastRepository extends JpaRepository<StockForecast, Integer> {

    /**
     * Tìm dự báo theo variant ID
     */
    List<StockForecast> findByVariantVariantId(Integer variantId);

    /**
     * Tìm dự báo theo variant và ngày
     */
    Optional<StockForecast> findByVariantVariantIdAndForecastDate(Integer variantId, LocalDate forecastDate);

    /**
     * Tìm dự báo theo variant trong khoảng thời gian
     */
    @Query("SELECT sf FROM StockForecast sf WHERE sf.variant.variantId = :variantId " +
           "AND sf.forecastDate BETWEEN :startDate AND :endDate ORDER BY sf.forecastDate ASC")
    List<StockForecast> findByVariantAndDateRange(
        @Param("variantId") Integer variantId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Tìm dự báo cho N ngày tới của một variant
     */
    @Query("SELECT sf FROM StockForecast sf WHERE sf.variant.variantId = :variantId " +
           "AND sf.forecastDate >= CURRENT_DATE AND sf.forecastDate <= :endDate " +
           "ORDER BY sf.forecastDate ASC")
    List<StockForecast> findUpcomingForecastsByVariant(
        @Param("variantId") Integer variantId,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Tìm tất cả dự báo cho một ngày cụ thể
     */
    List<StockForecast> findByForecastDate(LocalDate forecastDate);

    /**
     * Tìm dự báo có độ tin cậy cao (>= threshold)
     */
    @Query("SELECT sf FROM StockForecast sf WHERE sf.confidenceLevel >= :threshold ORDER BY sf.forecastDate ASC")
    List<StockForecast> findHighConfidenceForecasts(@Param("threshold") Double threshold);

    /**
     * Tìm dự báo tồn kho thấp (predicted_stock <= threshold)
     */
    @Query("SELECT sf FROM StockForecast sf WHERE sf.predictedStock <= :threshold " +
           "AND sf.forecastDate >= CURRENT_DATE ORDER BY sf.forecastDate ASC")
    List<StockForecast> findLowStockForecasts(@Param("threshold") Integer threshold);

    /**
     * Tìm dự báo tồn kho thấp cho variant cụ thể
     */
    @Query("SELECT sf FROM StockForecast sf WHERE sf.variant.variantId = :variantId " +
           "AND sf.predictedStock <= :threshold AND sf.forecastDate >= CURRENT_DATE " +
           "ORDER BY sf.forecastDate ASC")
    List<StockForecast> findLowStockForecastsByVariant(
        @Param("variantId") Integer variantId,
        @Param("threshold") Integer threshold
    );

    /**
     * Xóa dự báo cũ (quá 90 ngày)
     */
    @Query("DELETE FROM StockForecast sf WHERE sf.forecastDate < :cutoffDate")
    void deleteOldForecasts(@Param("cutoffDate") LocalDate cutoffDate);

    /**
     * Đếm số dự báo theo variant
     */
    long countByVariantVariantId(Integer variantId);

    /**
     * Lấy dự báo mới nhất cho variant
     */
    @Query("SELECT sf FROM StockForecast sf WHERE sf.variant.variantId = :variantId " +
           "ORDER BY sf.createdAt DESC LIMIT 1")
    Optional<StockForecast> findLatestForecastByVariant(@Param("variantId") Integer variantId);

    /**
     * Tính trung bình predicted_sales cho variant trong khoảng thời gian
     */
    @Query("SELECT AVG(sf.predictedSales) FROM StockForecast sf " +
           "WHERE sf.variant.variantId = :variantId " +
           "AND sf.forecastDate BETWEEN :startDate AND :endDate")
    Optional<Double> calculateAveragePredictedSales(
        @Param("variantId") Integer variantId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Kiểm tra xem đã có dự báo cho variant và ngày cụ thể chưa
     */
    boolean existsByVariantVariantIdAndForecastDate(Integer variantId, LocalDate forecastDate);
}