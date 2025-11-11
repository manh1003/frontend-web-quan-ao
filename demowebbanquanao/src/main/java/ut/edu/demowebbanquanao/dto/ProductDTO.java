package ut.edu.demowebbanquanao.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProductDTO {
    private Integer productId;
    
    @NotBlank(message = "SKU không được để trống")
    @Size(max = 50, message = "SKU không được vượt quá 50 ký tự")
    private String sku;
    
    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 200, message = "Tên sản phẩm không được vượt quá 200 ký tự")
    private String productName;
    
    private Integer categoryId;
    private String categoryName;
    private Integer brandId;
    private String brandName;
    
    @Size(max = 100, message = "Chất liệu không được vượt quá 100 ký tự")
    private String material;
    
    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;
    
    @Size(max = 2000, message = "Hướng dẫn bảo quản không được vượt quá 2000 ký tự")
    private String careInstructions;
    
    private Boolean isActive;
    private Integer createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Relations
    private List<ProductVariantDTO> variants;
    private List<ProductImageDTO> images;
    private BrandDTO brand;
    private ProductCategoryDTO category;
}
