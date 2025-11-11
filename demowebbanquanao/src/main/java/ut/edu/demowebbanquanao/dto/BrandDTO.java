package ut.edu.demowebbanquanao.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
public class BrandDTO {
    private Integer brandId;
    private String brandName;
    private String description;
    private String country;
    private String website;
    private Boolean isActive;

    public BrandDTO(Integer brandId, String brandName, String description, 
                    String country, String website, Boolean isActive) {
        this.brandId = brandId;
        this.brandName = brandName;
        this.description = description;
        this.country = country;
        this.website = website;
        this.isActive = isActive;
    }
}
