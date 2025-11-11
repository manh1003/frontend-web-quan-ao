package ut.edu.demowebbanquanao.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class OrderDetailDTO {
    private Integer orderDetailId;
    private Integer orderId;

    @JsonProperty("variant_id") // Accept cả variant_id và variantId từ frontend
    private Integer variantId;

    private Integer quantity;

    @JsonProperty("unit_price")
    private BigDecimal unitPrice;

    @JsonProperty("discount_amount")
    private BigDecimal discountAmount;

    private BigDecimal totalPrice;
    
    // Thông tin sản phẩm (cho hiển thị)
    @JsonProperty("product_name")
    private String productName;
    
    @JsonProperty("variant_sku")
    private String variantSku;
    
    private String color;
    private String size;
}
