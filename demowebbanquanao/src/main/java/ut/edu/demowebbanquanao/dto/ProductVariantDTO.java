package ut.edu.demowebbanquanao.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantDTO {
    private Integer variantId;
    private Integer productId;
    private String productName;
    private String productSku;
    private String variantSku; // Đổi từ sku thành variantSku để đồng bộ với frontend
    private String size;
    private String color;
    private BigDecimal price;
    private BigDecimal salePrice;
    private Integer stockQuantity;
    private Integer minStockThreshold; // Đổi từ minStockLevel thành minStockThreshold để đồng bộ với frontend
    private Boolean isActive;
}
