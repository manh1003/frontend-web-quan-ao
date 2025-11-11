package ut.edu.demowebbanquanao.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import ut.edu.demowebbanquanao.entity.StockAlert;
import ut.edu.demowebbanquanao.entity.StockAlert.AlertStatus;
import ut.edu.demowebbanquanao.entity.StockAlert.AlertType;

/**
 * Repository cho StockAlert
 * Quản lý các cảnh báo tồn kho
 */
@Repository
public interface StockAlertRepository extends JpaRepository<StockAlert, Integer> {

    /**
     * Tìm tất cả cảnh báo theo trạng thái
     */
    List<StockAlert> findByAlertStatus(AlertStatus status);

    /**
     * Tìm tất cả cảnh báo theo loại
     */
    List<StockAlert> findByAlertType(AlertType type);

    /**
     * Tìm cảnh báo theo variant ID
     */
    List<StockAlert> findByVariantVariantId(Integer variantId);

    /**
     * Tìm cảnh báo đang chờ xử lý (PENDING)
     */
    List<StockAlert> findByAlertStatusOrderByCreatedAtDesc(AlertStatus status);

    /**
     * Tìm cảnh báo theo trạng thái và loại
     */
    List<StockAlert> findByAlertStatusAndAlertType(AlertStatus status, AlertType type);

    /**
     * Tìm cảnh báo URGENT (OUT_OF_STOCK và PENDING)
     */
    @Query("SELECT sa FROM StockAlert sa WHERE sa.alertType = 'OUT_OF_STOCK' AND sa.alertStatus = 'PENDING' ORDER BY sa.createdAt DESC")
    List<StockAlert> findUrgentAlerts();

    /**
     * Tìm cảnh báo trong khoảng thời gian
     */
    List<StockAlert> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Đếm số cảnh báo theo trạng thái
     */
    long countByAlertStatus(AlertStatus status);

    /**
     * Đếm số cảnh báo PENDING
     */
    @Query("SELECT COUNT(sa) FROM StockAlert sa WHERE sa.alertStatus = 'PENDING'")
    long countPendingAlerts();

    /**
     * Tìm cảnh báo chưa giải quyết cho một variant cụ thể
     */
    @Query("SELECT sa FROM StockAlert sa WHERE sa.variant.variantId = :variantId AND sa.alertStatus = 'PENDING' ORDER BY sa.createdAt DESC")
    List<StockAlert> findPendingAlertsByVariant(@Param("variantId") Integer variantId);

    /**
     * Xóa các cảnh báo đã giải quyết cũ (quá 30 ngày)
     */
    @Query("DELETE FROM StockAlert sa WHERE sa.alertStatus = 'RESOLVED' AND sa.resolvedAt < :cutoffDate")
    void deleteOldResolvedAlerts(@Param("cutoffDate") LocalDateTime cutoffDate);

    /**
     * Lấy thống kê cảnh báo theo loại
     */
    @Query("SELECT sa.alertType, COUNT(sa) FROM StockAlert sa WHERE sa.alertStatus = 'PENDING' GROUP BY sa.alertType")
    List<Object[]> getAlertStatistics();
}