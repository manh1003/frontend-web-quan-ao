package ut.edu.demowebbanquanao.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeroBannerDTO {
    private Long bannerId;
    private String title;
    private String subtitle;
    private String imageUrl;
    private String linkUrl;
    private String buttonText;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String backgroundColor;
    private String textColor;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}






