package ut.edu.demowebbanquanao.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import ut.edu.demowebbanquanao.entity.ReorderSuggestion;
import ut.edu.demowebbanquanao.entity.ReorderSuggestion.Priority;
import ut.edu.demowebbanquanao.entity.ReorderSuggestion.Status;

/**
 * Repository cho ReorderSuggestion
 * Quản lý các đề xuất nhập hàng
 */
@Repository
public interface ReorderSuggestionRepository extends JpaRepository<ReorderSuggestion, Integer> {

    /**
     * Tìm tất cả đề xuất theo trạng thái
     */
    List<ReorderSuggestion> findByStatus(Status status);

    /**
     * Tìm đề xuất theo mức độ ưu tiên
     */
    List<ReorderSuggestion> findByPriority(Priority priority);

    /**
     * Tìm đề xuất theo trạng thái và sắp xếp theo ưu tiên
     */
    @Query("SELECT rs FROM ReorderSuggestion rs WHERE rs.status = :status ORDER BY " +
           "CASE rs.priority " +
           "WHEN 'URGENT' THEN 1 " +
           "WHEN 'HIGH' THEN 2 " +
           "WHEN 'MEDIUM' THEN 3 " +
           "WHEN 'LOW' THEN 4 " +
           "END, rs.createdAt DESC")
    List<ReorderSuggestion> findByStatusOrderByPriority(@Param("status") Status status);

    /**
     * Tìm đề xuất PENDING sắp xếp theo ưu tiên
     */
    @Query("SELECT rs FROM ReorderSuggestion rs WHERE rs.status = 'PENDING' ORDER BY " +
           "CASE rs.priority " +
           "WHEN 'URGENT' THEN 1 " +
           "WHEN 'HIGH' THEN 2 " +
           "WHEN 'MEDIUM' THEN 3 " +
           "WHEN 'LOW' THEN 4 " +
           "END, rs.createdAt DESC")
    List<ReorderSuggestion> findPendingSuggestionsOrderedByPriority();

    /**
     * Tìm đề xuất theo variant ID
     */
    List<ReorderSuggestion> findByVariantVariantId(Integer variantId);

    /**
     * Tìm đề xuất đang hoạt động cho một variant (PENDING, APPROVED, ORDERED)
     */
    @Query("SELECT rs FROM ReorderSuggestion rs WHERE rs.variant.variantId = :variantId " +
           "AND rs.status IN ('PENDING', 'APPROVED', 'ORDERED') ORDER BY rs.createdAt DESC")
    List<ReorderSuggestion> findActiveSuggestionsByVariant(@Param("variantId") Integer variantId);

    /**
     * Kiểm tra xem variant đã có đề xuất đang hoạt động chưa
     */
    @Query("SELECT CASE WHEN COUNT(rs) > 0 THEN true ELSE false END FROM ReorderSuggestion rs " +
           "WHERE rs.variant.variantId = :variantId AND rs.status IN ('PENDING', 'APPROVED', 'ORDERED')")
    boolean existsActiveSuggestionForVariant(@Param("variantId") Integer variantId);

    /**
     * Tìm đề xuất theo supplier
     */
    List<ReorderSuggestion> findBySupplierSupplierId(Integer supplierId);

    /**
     * Tìm đề xuất URGENT
     */
    @Query("SELECT rs FROM ReorderSuggestion rs WHERE rs.priority = 'URGENT' AND rs.status = 'PENDING' ORDER BY rs.createdAt DESC")
    List<ReorderSuggestion> findUrgentSuggestions();

    /**
     * Tìm đề xuất đã được phê duyệt nhưng chưa tạo PO
     */
    @Query("SELECT rs FROM ReorderSuggestion rs WHERE rs.status = 'APPROVED' AND rs.purchaseOrder IS NULL ORDER BY rs.createdAt ASC")
    List<ReorderSuggestion> findApprovedWithoutPO();

    /**
     * Đếm số đề xuất theo trạng thái
     */
    long countByStatus(Status status);

    /**
     * Đếm số đề xuất PENDING
     */
    @Query("SELECT COUNT(rs) FROM ReorderSuggestion rs WHERE rs.status = 'PENDING'")
    long countPendingSuggestions();

    /**
     * Tính tổng giá trị đề xuất PENDING
     */
    @Query("SELECT SUM(rs.suggestedQuantity * rs.suggestedUnitPrice) FROM ReorderSuggestion rs WHERE rs.status = 'PENDING'")
    Optional<Double> calculateTotalPendingValue();

    /**
     * Tìm đề xuất trong khoảng thời gian
     */
    List<ReorderSuggestion> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Lấy thống kê đề xuất theo ưu tiên
     */
    @Query("SELECT rs.priority, COUNT(rs), SUM(rs.suggestedQuantity * rs.suggestedUnitPrice) " +
           "FROM ReorderSuggestion rs WHERE rs.status = 'PENDING' GROUP BY rs.priority")
    List<Object[]> getSuggestionStatisticsByPriority();

    /**
     * Tìm đề xuất theo PO ID
     */
    Optional<ReorderSuggestion> findByPurchaseOrderPoId(Integer poId);

    /**
     * Xóa các đề xuất bị từ chối cũ (quá 90 ngày)
     */
    @Query("DELETE FROM ReorderSuggestion rs WHERE rs.status = 'REJECTED' AND rs.updatedAt < :cutoffDate")
    void deleteOldRejectedSuggestions(@Param("cutoffDate") LocalDateTime cutoffDate);
}