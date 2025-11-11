package ut.edu.demowebbanquanao.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionProductDTO {

    private Integer promotionProductId;

    @NotNull(message = "Promotion ID không được để trống")
    private Integer promotionId;

    private String promotionName;

    @NotNull(message = "Product ID không được để trống")
    private Integer productId;

    private String productName;

    private BigDecimal discountPercentage;

    private BigDecimal discountFixedAmount;

    @Min(value = 1, message = "Số lượng tối thiểu phải >= 1")
    private Integer minQuantity = 1;

    private Integer maxQuantity;

    private LocalDateTime createdAt;
}