package ut.edu.demowebbanquanao.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class CustomerDTO {
    @JsonProperty("customer_id")
    private Integer customerId;
    
    private String email;
    private String phone;
    
    @JsonProperty("full_name")
    private String fullName;
    
    private String gender;
    
    @JsonProperty("date_of_birth")
    private LocalDate dateOfBirth;
    
    @JsonProperty("customer_tier")
    private String customerTier;
    
    @JsonProperty("total_orders")
    private Integer totalOrders;
    
    @JsonProperty("total_spent")
    private BigDecimal totalSpent;
    
    @JsonProperty("registration_date")
    private LocalDateTime registrationDate;
    
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
