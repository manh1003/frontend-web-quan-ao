package ut.edu.demowebbanquanao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import ut.edu.demowebbanquanao.entity.PromotionProduct;

@Repository
public interface PromotionProductRepository extends JpaRepository<PromotionProduct, Integer> {

    // Lấy tất cả sản phẩm của một promotion
    List<PromotionProduct> findByPromotionPromotionId(Integer promotionId);

    // Lấy tất cả promotion của một sản phẩm
    List<PromotionProduct> findByProductProductId(Integer productId);

    // Xóa tất cả promotion products theo promotion ID
    void deleteByPromotionPromotionId(Integer promotionId);

    // Xóa tất cả promotion products theo product ID
    void deleteByProductProductId(Integer productId);

    // Kiểm tra sản phẩm đã có trong promotion chưa
    boolean existsByPromotionPromotionIdAndProductProductId(Integer promotionId, Integer productId);

    // Lấy promotion product theo promotion và product
    PromotionProduct findByPromotionPromotionIdAndProductProductId(Integer promotionId, Integer productId);

    // Đếm số lượng sản phẩm trong promotion
    @Query("SELECT COUNT(pp) FROM PromotionProduct pp WHERE pp.promotion.promotionId = :promotionId")
    Long countProductsByPromotion(@Param("promotionId") Integer promotionId);

    // Lấy sản phẩm có discount cao nhất trong promotion
    @Query("SELECT pp FROM PromotionProduct pp WHERE pp.promotion.promotionId = :promotionId " +
           "ORDER BY pp.discountPercentage DESC, pp.discountFixedAmount DESC")
    List<PromotionProduct> findTopDiscountProducts(@Param("promotionId") Integer promotionId);
}