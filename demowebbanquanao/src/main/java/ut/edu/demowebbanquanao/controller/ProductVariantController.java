package ut.edu.demowebbanquanao.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import ut.edu.demowebbanquanao.dto.ProductVariantDTO;
import ut.edu.demowebbanquanao.exception.ApiResponse;
import ut.edu.demowebbanquanao.service.ProductVariantService;

@RestController
@RequestMapping("/api/product-variants")
@RequiredArgsConstructor
public class ProductVariantController {
    private final ProductVariantService variantService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductVariantDTO>>> getAllVariants() {
        List<ProductVariantDTO> variants = variantService.getAllVariants();
        return ResponseEntity.ok(ApiResponse.success(variants));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ProductVariantDTO>>> getVariantsByProduct(@PathVariable Integer productId) {
        List<ProductVariantDTO> variants = variantService.getVariantsByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success(variants));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<ProductVariantDTO>>> getLowStockVariants() {
        List<ProductVariantDTO> variants = variantService.getLowStockVariants();
        return ResponseEntity.ok(ApiResponse.success(variants));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductVariantDTO>> getVariantById(@PathVariable Integer id) {
        ProductVariantDTO variant = variantService.getVariantById(id);
        return ResponseEntity.ok(ApiResponse.success(variant));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProductVariantDTO>> createVariant(@RequestBody ProductVariantDTO dto) {
        ProductVariantDTO created = variantService.createVariant(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo biến thể thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProductVariantDTO>> updateVariant(@PathVariable Integer id,
            @RequestBody ProductVariantDTO dto) {
        ProductVariantDTO updated = variantService.updateVariant(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật biến thể thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteVariant(@PathVariable Integer id) {
        variantService.deleteVariant(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa biến thể thành công", null));
    }
}
