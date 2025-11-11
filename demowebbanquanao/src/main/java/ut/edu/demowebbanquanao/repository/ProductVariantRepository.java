package ut.edu.demowebbanquanao.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ut.edu.demowebbanquanao.entity.ProductVariant;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {
    List<ProductVariant> findByProductId(Integer productId);

    @Query("SELECT v FROM ProductVariant v WHERE v.stockQuantity < v.minStockThreshold")
    List<ProductVariant> findByStockQuantityLessThanMinStockThreshold();
}
