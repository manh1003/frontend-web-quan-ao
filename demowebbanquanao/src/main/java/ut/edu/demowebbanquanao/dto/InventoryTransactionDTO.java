package ut.edu.demowebbanquanao.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransactionDTO {

    private Integer transactionId;

    @NotNull(message = "Variant ID không được để trống")
    private Integer variantId;

    private String variantName;
    private String variantSku;

    @NotBlank(message = "Loại transaction không được để trống")
    private String transactionType; // IN, OUT, ADJUSTMENT

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;

    private Integer stockBefore;
    private Integer stockAfter;

    private String referenceType; // ORDER, PURCHASE_ORDER, MANUAL, etc.
    private Integer referenceId;
    private String notes;

    private Integer createdById;
    private String createdByName;
    private LocalDateTime createdAt;
}