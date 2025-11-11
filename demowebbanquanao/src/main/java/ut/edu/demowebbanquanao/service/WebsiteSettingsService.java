package ut.edu.demowebbanquanao.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import ut.edu.demowebbanquanao.dto.WebsiteSettingsDTO;
import ut.edu.demowebbanquanao.entity.WebsiteSettings;
import ut.edu.demowebbanquanao.repository.WebsiteSettingsRepository;

@Service
@RequiredArgsConstructor
public class WebsiteSettingsService {
    
    private final WebsiteSettingsRepository settingsRepository;
    private final ObjectMapper objectMapper;
    
    private static final String SETTINGS_KEY = "website_settings";
    
    /**
     * Lấy tất cả cài đặt website
     */
    public WebsiteSettingsDTO getSettings() {
        return settingsRepository.findBySettingKey(SETTINGS_KEY)
            .map(this::convertToDTO)
            .orElseGet(this::getDefaultSettings);
    }
    
    /**
     * Cập nhật cài đặt website
     */
    @Transactional
    public WebsiteSettingsDTO updateSettings(WebsiteSettingsDTO settingsDTO) {
        WebsiteSettings settings = settingsRepository.findBySettingKey(SETTINGS_KEY)
            .orElse(new WebsiteSettings());
        
        settings.setSettingKey(SETTINGS_KEY);
        settings.setDescription("Website theme and general settings");
        
        try {
            // Convert DTO to JSON string for storage
            String jsonValue = objectMapper.writeValueAsString(settingsDTO);
            settings.setSettingValue(jsonValue);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting settings to JSON", e);
        }
        
        WebsiteSettings savedSettings = settingsRepository.save(settings);
        return convertToDTO(savedSettings);
    }
    
    /**
     * Reset về cài đặt mặc định
     */
    @Transactional
    public WebsiteSettingsDTO resetToDefault() {
        WebsiteSettingsDTO defaultSettings = getDefaultSettings();
        // Reuse the update logic to save the default settings
        return updateSettings(defaultSettings);
    }
    
    /**
     * Lấy một setting cụ thể theo key
     */
    public String getSetting(String key) {
        WebsiteSettingsDTO settings = getSettings();
        Map<String, String> settingsMap = settings.toMap();
        return settingsMap.getOrDefault(key, "");
    }
    
    /**
     * Cập nhật một setting cụ thể
     */
    @Transactional
    public WebsiteSettingsDTO updateSetting(String key, String value) {
        WebsiteSettingsDTO currentSettings = getSettings();
        
        // Update specific field
        switch (key) {
            case "siteName" -> currentSettings.setSiteName(value);
            case "siteDescription" -> currentSettings.setSiteDescription(value);
            case "logoUrl" -> currentSettings.setLogoUrl(value);
            case "faviconUrl" -> currentSettings.setFaviconUrl(value);
            case "contactEmail" -> currentSettings.setContactEmail(value);
            case "contactPhone" -> currentSettings.setContactPhone(value);
            case "address" -> currentSettings.setAddress(value);
            case "primaryColor" -> currentSettings.setPrimaryColor(value);
            case "secondaryColor" -> currentSettings.setSecondaryColor(value);
            default -> throw new IllegalArgumentException("Invalid setting key: " + key);
        }
        
        return updateSettings(currentSettings);
    }
    
    /**
     * Convert Entity to DTO
     */
    private WebsiteSettingsDTO convertToDTO(WebsiteSettings settings) {
        try {
            return objectMapper.readValue(settings.getSettingValue(), WebsiteSettingsDTO.class);
        } catch (JsonProcessingException e) {
            // If parsing fails, return default settings
            return getDefaultSettings();
        }
    }
    
    /**
     * Lấy cài đặt mặc định
     */
    private WebsiteSettingsDTO getDefaultSettings() {
        WebsiteSettingsDTO dto = new WebsiteSettingsDTO();
        dto.setSiteName("Fashion Store");
        dto.setSiteDescription("Cửa hàng thời trang trực tuyến");
        dto.setLogoUrl("");
        dto.setFaviconUrl("");
        dto.setContactEmail("contact@fashionstore.com");
        dto.setContactPhone("0123456789");
        dto.setAddress("123 Đường ABC, Quận 1, TP.HCM");
        dto.setPrimaryColor("#6366f1");
        dto.setSecondaryColor("#ec4899");
        return dto;
    }
}