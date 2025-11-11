package ut.edu.demowebbanquanao.dto;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebsiteSettingsDTO {
    private String siteName;
    private String siteDescription;
    private String logoUrl;
    private String faviconUrl;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private String primaryColor;
    private String secondaryColor;
    
    // Constructor from Map for easy conversion
    public static WebsiteSettingsDTO fromMap(Map<String, String> settings) {
        WebsiteSettingsDTO dto = new WebsiteSettingsDTO();
        dto.setSiteName(settings.getOrDefault("siteName", "Fashion Store"));
        dto.setSiteDescription(settings.getOrDefault("siteDescription", "Cửa hàng thời trang trực tuyến"));
        dto.setLogoUrl(settings.getOrDefault("logoUrl", ""));
        dto.setFaviconUrl(settings.getOrDefault("faviconUrl", ""));
        dto.setContactEmail(settings.getOrDefault("contactEmail", "contact@fashionstore.com"));
        dto.setContactPhone(settings.getOrDefault("contactPhone", "0123456789"));
        dto.setAddress(settings.getOrDefault("address", "123 Đường ABC, Quận 1, TP.HCM"));
        dto.setPrimaryColor(settings.getOrDefault("primaryColor", "#6366f1"));
        dto.setSecondaryColor(settings.getOrDefault("secondaryColor", "#ec4899"));
        return dto;
    }
    
    // Convert to Map for easy storage
    public Map<String, String> toMap() {
        return Map.of(
            "siteName", siteName != null ? siteName : "",
            "siteDescription", siteDescription != null ? siteDescription : "",
            "logoUrl", logoUrl != null ? logoUrl : "",
            "faviconUrl", faviconUrl != null ? faviconUrl : "",
            "contactEmail", contactEmail != null ? contactEmail : "",
            "contactPhone", contactPhone != null ? contactPhone : "",
            "address", address != null ? address : "",
            "primaryColor", primaryColor != null ? primaryColor : "#6366f1",
            "secondaryColor", secondaryColor != null ? secondaryColor : "#ec4899"
        );
    }
}