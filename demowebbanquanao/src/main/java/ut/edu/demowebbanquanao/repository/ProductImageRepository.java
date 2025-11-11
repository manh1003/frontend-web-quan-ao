package ut.edu.demowebbanquanao.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import ut.edu.demowebbanquanao.entity.ProductImage;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Integer> {
    
    /**
     * Tìm tất cả hình ảnh của một sản phẩm, sắp xếp theo thứ tự hiển thị
     */
    List<ProductImage> findByProduct_ProductIdOrderByDisplayOrderAsc(Integer productId);
    
    /**
     * Tìm hình ảnh chính của sản phẩm
     */
    Optional<ProductImage> findByProduct_ProductIdAndIsPrimaryTrue(Integer productId);
    
    /**
     * Tìm hình ảnh của một biến thể sản phẩm
     */
    List<ProductImage> findByVariant_VariantIdOrderByDisplayOrderAsc(Integer variantId);
    
    /**
     * Đếm số lượng hình ảnh của sản phẩm
     */
    long countByProduct_ProductId(Integer productId);
    
    /**
     * Xóa tất cả hình ảnh của sản phẩm
     */
    void deleteByProduct_ProductId(Integer productId);
    
    /**
     * Xóa tất cả hình ảnh của biến thể
     */
    void deleteByVariant_VariantId(Integer variantId);
    
    /**
     * Bỏ trạng thái primary của tất cả hình ảnh sản phẩm
     */
    @Modifying
    @Query("UPDATE ProductImage pi SET pi.isPrimary = false WHERE pi.product.productId = :productId")
    @org.springframework.transaction.annotation.Transactional
    void unsetPrimaryImageForProduct(@Param("productId") Integer productId);
}