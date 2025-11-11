package ut.edu.demowebbanquanao.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import ut.edu.demowebbanquanao.entity.Promotion;
import ut.edu.demowebbanquanao.entity.Promotion.PromotionType;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {

    // Lấy promotion theo tên
    List<Promotion> findByPromotionNameContainingIgnoreCase(String name);

    // Lấy promotion theo trạng thái
    List<Promotion> findByIsActive(Boolean isActive);

    // Lấy promotion theo loại
    List<Promotion> findByPromotionType(PromotionType type);

    // Lấy promotion đang hoạt động trong thời gian hiện tại
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true " +
           "AND p.startDate <= :now AND p.endDate >= :now")
    List<Promotion> findActivePromotions(@Param("now") LocalDateTime now);

    // Lấy promotion sắp bắt đầu
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true " +
           "AND p.startDate > :now ORDER BY p.startDate ASC")
    List<Promotion> findUpcomingPromotions(@Param("now") LocalDateTime now);

    // Lấy promotion đã kết thúc
    @Query("SELECT p FROM Promotion p WHERE p.endDate < :now ORDER BY p.endDate DESC")
    List<Promotion> findExpiredPromotions(@Param("now") LocalDateTime now);

    // Lấy promotion trong khoảng thời gian
    @Query("SELECT p FROM Promotion p WHERE p.startDate BETWEEN :startDate AND :endDate " +
           "OR p.endDate BETWEEN :startDate AND :endDate")
    List<Promotion> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Lấy promotion theo loại và trạng thái
    List<Promotion> findByPromotionTypeAndIsActive(PromotionType type, Boolean isActive);

    // Kiểm tra promotion tồn tại
    boolean existsByPromotionNameIgnoreCase(String promotionName);
}