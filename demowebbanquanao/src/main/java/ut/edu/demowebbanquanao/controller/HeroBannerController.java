package ut.edu.demowebbanquanao.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ut.edu.demowebbanquanao.dto.HeroBannerDTO;
import ut.edu.demowebbanquanao.exception.ApiResponse;
import ut.edu.demowebbanquanao.service.HeroBannerService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HeroBannerController {

    @Autowired
    private HeroBannerService heroBannerService;

    // Public endpoint - Get active banners for homepage
    @GetMapping("/banners/active")
    public ResponseEntity<ApiResponse<List<HeroBannerDTO>>> getActiveBanners() {
        List<HeroBannerDTO> banners = heroBannerService.getActiveBanners();
        return ResponseEntity.ok(new ApiResponse<>(true, "Active banners retrieved successfully", banners));
    }

    // Public endpoint - Get current active banners (within date range)
    @GetMapping("/banners/current")
    public ResponseEntity<ApiResponse<List<HeroBannerDTO>>> getCurrentActiveBanners() {
        List<HeroBannerDTO> banners = heroBannerService.getCurrentActiveBanners();
        return ResponseEntity.ok(new ApiResponse<>(true, "Current banners retrieved successfully", banners));
    }

    // Admin endpoints - Require authentication
    @GetMapping("/admin/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<HeroBannerDTO>>> getAllBanners() {
        List<HeroBannerDTO> banners = heroBannerService.getAllBanners();
        return ResponseEntity.ok(new ApiResponse<>(true, "All banners retrieved successfully", banners));
    }

    @GetMapping("/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HeroBannerDTO>> getBannerById(@PathVariable Long id) {
        HeroBannerDTO banner = heroBannerService.getBannerById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Banner retrieved successfully", banner));
    }

    @PostMapping("/admin/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HeroBannerDTO>> createBanner(@RequestBody HeroBannerDTO bannerDTO) {
        HeroBannerDTO createdBanner = heroBannerService.createBanner(bannerDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Banner created successfully", createdBanner));
    }

    @PutMapping("/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HeroBannerDTO>> updateBanner(
            @PathVariable Long id,
            @RequestBody HeroBannerDTO bannerDTO) {
        HeroBannerDTO updatedBanner = heroBannerService.updateBanner(id, bannerDTO);
        return ResponseEntity.ok(new ApiResponse<>(true, "Banner updated successfully", updatedBanner));
    }

    @DeleteMapping("/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(@PathVariable Long id) {
        heroBannerService.deleteBanner(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Banner deleted successfully", null));
    }

    @PatchMapping("/admin/banners/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HeroBannerDTO>> toggleBannerStatus(@PathVariable Long id) {
        HeroBannerDTO updatedBanner = heroBannerService.toggleBannerStatus(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Banner status toggled successfully", updatedBanner));
    }
}






