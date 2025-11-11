package ut.edu.demowebbanquanao.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class OrderDTO {
    @JsonProperty("order_id")
    private Integer orderId;

    @JsonProperty("order_number")
    private String orderNumber;

    @JsonProperty("customer_id")
    private Integer customerId;

    @JsonProperty("customer_name")
    private String customerName;
    
    private CustomerDTO customer;

    @JsonProperty("shipping_address_id")
    private Integer shippingAddressId;
    
    @JsonProperty("shipping_address")
    private CustomerAddressDTO shippingAddress;
    
    @JsonProperty("shipping_code")
    private String shippingCode;

    @JsonProperty("shipping_method")
    private String shippingMethod;

    @JsonProperty("order_date")
    private LocalDateTime orderDate;

    private String status;

    @JsonProperty("payment_method")
    private String paymentMethod;

    @JsonProperty("payment_status")
    private String paymentStatus;

    private BigDecimal subtotal;

    @JsonProperty("shipping_fee")
    private BigDecimal shippingFee;

    @JsonProperty("discount_amount")
    private BigDecimal discountAmount;

    @JsonProperty("total_amount")
    private BigDecimal totalAmount;

    private String notes;

    @JsonProperty("cancellation_reason")
    private String cancellationReason;

    @JsonProperty("return_reason")
    private String returnReason;

    @JsonProperty("created_by")
    private Integer createdBy;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    private List<OrderDetailDTO> items; // Danh sách sản phẩm trong đơn hàng
}
