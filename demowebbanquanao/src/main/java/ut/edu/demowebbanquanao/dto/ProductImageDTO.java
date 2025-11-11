package ut.edu.demowebbanquanao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductImageDTO {
    
    private Integer imageId;
    
    @NotNull(message = "Product ID không được để trống")
    private Integer productId;
    
    private Integer variantId;
    
    @NotBlank(message = "URL hình ảnh không được để trống")
    private String imageUrl;
    
    private Boolean isPrimary;
    
    private Integer displayOrder;
    
    private String createdAt;
}