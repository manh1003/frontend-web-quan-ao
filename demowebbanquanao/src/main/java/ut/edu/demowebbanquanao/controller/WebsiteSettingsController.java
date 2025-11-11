package ut.edu.demowebbanquanao.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import ut.edu.demowebbanquanao.dto.WebsiteSettingsDTO;
import ut.edu.demowebbanquanao.service.WebsiteSettingsService;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WebsiteSettingsController {
    
    private final WebsiteSettingsService settingsService;
    
    /**
     * GET /api/settings - Lấy tất cả cài đặt website
     */
    @GetMapping
    public ResponseEntity<WebsiteSettingsDTO> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }
    
    /**
     * PUT /api/settings - Cập nhật tất cả cài đặt website
     */
    @PutMapping
    public ResponseEntity<WebsiteSettingsDTO> updateSettings(@RequestBody WebsiteSettingsDTO settingsDTO) {
        return ResponseEntity.ok(settingsService.updateSettings(settingsDTO));
    }
    
    /**
     * POST /api/settings/reset - Reset về cài đặt mặc định
     */
    @PostMapping("/reset")
    public ResponseEntity<WebsiteSettingsDTO> resetSettings() {
        return ResponseEntity.ok(settingsService.resetToDefault());
    }
    
    /**
     * GET /api/settings/{key} - Lấy một setting cụ thể
     */
    @GetMapping("/{key}")
    public ResponseEntity<Map<String, String>> getSetting(@PathVariable String key) {
        String value = settingsService.getSetting(key);
        return ResponseEntity.ok(Map.of("key", key, "value", value));
    }
    
    /**
     * PATCH /api/settings/{key} - Cập nhật một setting cụ thể
     */
    @PatchMapping("/{key}")
    public ResponseEntity<WebsiteSettingsDTO> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {
        String value = body.get("value");
        return ResponseEntity.ok(settingsService.updateSetting(key, value));
    }
}