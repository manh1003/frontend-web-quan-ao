package ut.edu.demowebbanquanao.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PurchaseOrderDetailDTO {
    
    private Integer poDetailId;
    
    private Integer poId;
    
    @NotNull(message = "Biến thể sản phẩm không được để trống")
    private Integer variantId;
    
    private String variantSku;
    
    private String productName;
    
    private String color;
    
    private String size;
    
    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;
    
    @NotNull(message = "Đơn giá không được để trống")
    private BigDecimal unitPrice;
    
    private BigDecimal totalPrice;
    
    private Integer receivedQuantity;
}