package ut.edu.demowebbanquanao.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCategoryDTO {
    private Integer categoryId;
    private String categoryName;
    private Integer parentCategoryId;
    private String description;
    private Boolean isActive;
}