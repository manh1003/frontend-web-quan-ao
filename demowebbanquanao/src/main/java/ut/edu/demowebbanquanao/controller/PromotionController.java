package ut.edu.demowebbanquanao.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import ut.edu.demowebbanquanao.dto.PromotionDTO;
import ut.edu.demowebbanquanao.dto.PromotionProductDTO;
import ut.edu.demowebbanquanao.exception.ApiResponse;
import ut.edu.demowebbanquanao.service.PromotionService;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    // Tạo promotion mới
    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_PRODUCT')")
    public ResponseEntity<?> createPromotion(@Valid @RequestBody PromotionDTO dto) {
        try {
            PromotionDTO created = promotionService.createPromotion(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Tạo promotion thành công", created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Cập nhật promotion
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('EDIT_PRODUCT')")
    public ResponseEntity<?> updatePromotion(@PathVariable Integer id, @Valid @RequestBody PromotionDTO dto) {
        try {
            PromotionDTO updated = promotionService.updatePromotion(id, dto);
            return ResponseEntity.ok(new ApiResponse(true, "Cập nhật promotion thành công", updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy tất cả promotion
    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_PRODUCTS')")
    public ResponseEntity<?> getAllPromotions() {
        try {
            List<PromotionDTO> promotions = promotionService.getAllPromotions();
            return ResponseEntity.ok(new ApiResponse(true, "Lấy danh sách promotion thành công", promotions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy promotion theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_PRODUCTS')")
    public ResponseEntity<?> getPromotionById(@PathVariable Integer id) {
        try {
            PromotionDTO promotion = promotionService.getPromotionById(id);
            return ResponseEntity.ok(new ApiResponse(true, "Lấy promotion thành công", promotion));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy promotion đang hoạt động
    @GetMapping("/active")
    @PreAuthorize("hasAuthority('VIEW_PRODUCTS')")
    public ResponseEntity<?> getActivePromotions() {
        try {
            List<PromotionDTO> promotions = promotionService.getActivePromotions();
            return ResponseEntity.ok(new ApiResponse(true, "Lấy promotion đang hoạt động thành công", promotions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy promotion sắp bắt đầu
    @GetMapping("/upcoming")
    @PreAuthorize("hasAuthority('VIEW_PRODUCTS')")
    public ResponseEntity<?> getUpcomingPromotions() {
        try {
            List<PromotionDTO> promotions = promotionService.getUpcomingPromotions();
            return ResponseEntity.ok(new ApiResponse(true, "Lấy promotion sắp bắt đầu thành công", promotions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy promotion đã kết thúc
    @GetMapping("/expired")
    @PreAuthorize("hasAuthority('VIEW_PRODUCTS')")
    public ResponseEntity<?> getExpiredPromotions() {
        try {
            List<PromotionDTO> promotions = promotionService.getExpiredPromotions();
            return ResponseEntity.ok(new ApiResponse(true, "Lấy promotion đã kết thúc thành công", promotions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy promotion theo loại
    @GetMapping("/by-type/{type}")
    @PreAuthorize("hasAuthority('VIEW_PRODUCTS')")
    public ResponseEntity<?> getPromotionsByType(@PathVariable String type) {
        try {
            List<PromotionDTO> promotions = promotionService.getPromotionsByType(type);
            return ResponseEntity.ok(new ApiResponse(true, "Lấy promotion theo loại thành công", promotions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy promotion theo trạng thái
    @GetMapping("/by-status")
    @PreAuthorize("hasAuthority('VIEW_PRODUCTS')")
    public ResponseEntity<?> getPromotionsByStatus(@RequestParam Boolean isActive) {
        try {
            List<PromotionDTO> promotions = promotionService.getPromotionsByStatus(isActive);
            return ResponseEntity.ok(new ApiResponse(true, "Lấy promotion theo trạng thái thành công", promotions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Thêm sản phẩm vào promotion
    @PostMapping("/{promotionId}/products")
    @PreAuthorize("hasAuthority('EDIT_PRODUCT')")
    public ResponseEntity<?> addProductToPromotion(
            @PathVariable Integer promotionId,
            @Valid @RequestBody PromotionProductDTO dto) {
        try {
            PromotionProductDTO created = promotionService.addProductToPromotion(promotionId, dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Thêm sản phẩm vào promotion thành công", created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy sản phẩm trong promotion
    @GetMapping("/{promotionId}/products")
    @PreAuthorize("hasAuthority('VIEW_PRODUCTS')")
    public ResponseEntity<?> getProductsInPromotion(@PathVariable Integer promotionId) {
        try {
            List<PromotionProductDTO> products = promotionService.getProductsInPromotion(promotionId);
            return ResponseEntity.ok(new ApiResponse(true, "Lấy sản phẩm trong promotion thành công", products));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Xóa sản phẩm khỏi promotion
    @DeleteMapping("/{promotionId}/products/{productId}")
    @PreAuthorize("hasAuthority('EDIT_PRODUCT')")
    public ResponseEntity<?> removeProductFromPromotion(
            @PathVariable Integer promotionId,
            @PathVariable Integer productId) {
        try {
            promotionService.removeProductFromPromotion(promotionId, productId);
            return ResponseEntity.ok(new ApiResponse(true, "Xóa sản phẩm khỏi promotion thành công", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Kích hoạt/Vô hiệu hóa promotion
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasAuthority('EDIT_PRODUCT')")
    public ResponseEntity<?> togglePromotionStatus(@PathVariable Integer id) {
        try {
            PromotionDTO updated = promotionService.togglePromotionStatus(id);
            return ResponseEntity.ok(new ApiResponse(true, "Cập nhật trạng thái promotion thành công", updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Xóa promotion
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_PRODUCT')")
    public ResponseEntity<?> deletePromotion(@PathVariable Integer id) {
        try {
            promotionService.deletePromotion(id);
            return ResponseEntity.ok(new ApiResponse(true, "Xóa promotion thành công", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }
}