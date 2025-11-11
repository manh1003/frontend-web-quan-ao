package ut.edu.demowebbanquanao.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CustomerAddressDTO {
    
    @JsonProperty("address_id")
    private Integer addressId;
    
    @JsonProperty("customer_id")
    private Integer customerId;
    
    @Size(max = 100, message = "Tên người nhận không được quá 100 ký tự")
    @JsonProperty("recipient_name")
    private String recipientName;
    
    @Size(max = 20, message = "Số điện thoại không được quá 20 ký tự")
    private String phone;
    
    @NotBlank(message = "Địa chỉ không được để trống")
    @JsonProperty("address_line")
    private String addressLine;
    
    @Size(max = 100, message = "Phường/Xã không được quá 100 ký tự")
    private String ward;
    
    @Size(max = 100, message = "Quận/Huyện không được quá 100 ký tự")
    private String district;
    
    @Size(max = 100, message = "Tỉnh/Thành phố không được quá 100 ký tự")
    private String city;
    
    @JsonProperty("is_default")
    private Boolean isDefault;
    
    @JsonProperty("created_at")
    private String createdAt;
}