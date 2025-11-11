package ut.edu.demowebbanquanao.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import ut.edu.demowebbanquanao.entity.InventoryTransaction;
import ut.edu.demowebbanquanao.entity.InventoryTransaction.TransactionType;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Integer> {

    // Lấy tất cả transaction của một variant
    List<InventoryTransaction> findByVariantVariantIdOrderByCreatedAtDesc(Integer variantId);

    // Lấy transaction theo loại
    List<InventoryTransaction> findByTransactionTypeOrderByCreatedAtDesc(TransactionType transactionType);

    // Lấy transaction theo variant và loại
    List<InventoryTransaction> findByVariantVariantIdAndTransactionTypeOrderByCreatedAtDesc(
            Integer variantId, TransactionType transactionType);

    // Lấy transaction trong khoảng thời gian
    @Query("SELECT it FROM InventoryTransaction it WHERE it.createdAt BETWEEN :startDate AND :endDate ORDER BY it.createdAt DESC")
    List<InventoryTransaction> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Lấy transaction của variant trong khoảng thời gian
    @Query("SELECT it FROM InventoryTransaction it WHERE it.variant.variantId = :variantId " +
           "AND it.createdAt BETWEEN :startDate AND :endDate ORDER BY it.createdAt DESC")
    List<InventoryTransaction> findByVariantAndDateRange(
            @Param("variantId") Integer variantId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Lấy transaction theo reference
    List<InventoryTransaction> findByReferenceTypeAndReferenceIdOrderByCreatedAtDesc(
            String referenceType, Integer referenceId);

    // Lấy transaction của user tạo
    List<InventoryTransaction> findByCreatedByUserIdOrderByCreatedAtDesc(Integer userId);

    // Tính tổng số lượng IN của variant
    @Query("SELECT COALESCE(SUM(it.quantity), 0) FROM InventoryTransaction it " +
           "WHERE it.variant.variantId = :variantId AND it.transactionType = 'IN'")
    Integer calculateTotalInQuantity(@Param("variantId") Integer variantId);

    // Tính tổng số lượng OUT của variant
    @Query("SELECT COALESCE(SUM(it.quantity), 0) FROM InventoryTransaction it " +
           "WHERE it.variant.variantId = :variantId AND it.transactionType = 'OUT'")
    Integer calculateTotalOutQuantity(@Param("variantId") Integer variantId);

    // Tính số lượng tồn kho hiện tại của variant
    @Query("SELECT COALESCE(SUM(CASE WHEN it.transactionType = 'IN' THEN it.quantity " +
           "WHEN it.transactionType = 'OUT' THEN -it.quantity " +
           "ELSE it.quantity END), 0) FROM InventoryTransaction it " +
           "WHERE it.variant.variantId = :variantId")
    Integer calculateCurrentStock(@Param("variantId") Integer variantId);

    // Lấy transaction mới nhất của variant
    InventoryTransaction findFirstByVariantVariantIdOrderByCreatedAtDesc(Integer variantId);

    // Kiểm tra transaction tồn tại
    boolean existsByReferenceTypeAndReferenceId(String referenceType, Integer referenceId);
}