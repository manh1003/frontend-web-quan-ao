package ut.edu.demowebbanquanao.dto;

import java.time.LocalDateTime;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    private Integer userId;
    
    private String username;
    
    private String email;
    
    private String fullName;
    
    private String phone;
    
    private String roleName;
    
    private Set<String> permissions;
    
    private Boolean isActive;
    
    private Boolean emailVerified;
    
    private LocalDateTime lastLogin;
    
    private LocalDateTime createdAt;
}