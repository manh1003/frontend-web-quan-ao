package ut.edu.demowebbanquanao.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PurchaseOrderDTO {
    
    private Integer poId;
    
    @NotBlank(message = "Số đơn nhập hàng không được để trống")
    private String poNumber;
    
    @NotNull(message = "Nhà cung cấp không được để trống")
    private Integer supplierId;
    
    private String supplierName;
    
    @NotNull(message = "Ngày đặt hàng không được để trống")
    private String orderDate;
    
    private String expectedDate;
    
    private String receivedDate;
    
    private BigDecimal totalAmount;
    
    private String status;
    
    private String notes;
    
    private Integer createdBy;
    
    private String createdByName;
    
    private String createdAt;
    
    private String updatedAt;
    
    private List<PurchaseOrderDetailDTO> details;
}