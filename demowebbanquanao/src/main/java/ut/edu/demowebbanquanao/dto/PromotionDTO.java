package ut.edu.demowebbanquanao.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionDTO {

    private Integer promotionId;

    @NotBlank(message = "Tên khuyến mãi không được để trống")
    private String promotionName;

    private String description;

    @NotBlank(message = "Loại khuyến mãi không được để trống")
    private String promotionType; // PRODUCT_DISCOUNT, BUY_X_GET_Y, BUNDLE

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDateTime endDate;

    private Boolean isActive = true;
    private LocalDateTime createdAt;

    private List<PromotionProductDTO> promotionProducts = new ArrayList<>();
}