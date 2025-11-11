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
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import ut.edu.demowebbanquanao.dto.ProductImageDTO;
import ut.edu.demowebbanquanao.exception.ApiResponse;
import ut.edu.demowebbanquanao.service.ProductImageService;

@RestController
@RequestMapping("/api/product-images")
public class ProductImageController {

    @Autowired
    private ProductImageService imageService;

    /**
     * GET /api/product-images/product/{productId}
     * Lấy tất cả hình ảnh của sản phẩm
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ProductImageDTO>>> getProductImages(@PathVariable Integer productId) {
        List<ProductImageDTO> images = imageService.getImagesByProductId(productId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách hình ảnh sản phẩm thành công", images));
    }

    /**
     * GET /api/product-images/{id}
     * Lấy hình ảnh theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductImageDTO>> getImageById(@PathVariable Integer id) {
        ProductImageDTO image = imageService.getImageById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin hình ảnh thành công", image));
    }

    /**
     * GET /api/product-images/product/{productId}/primary
     * Lấy hình ảnh chính của sản phẩm
     */
    @GetMapping("/product/{productId}/primary")
    public ResponseEntity<ApiResponse<ProductImageDTO>> getPrimaryImage(@PathVariable Integer productId) {
        ProductImageDTO image = imageService.getPrimaryImageByProductId(productId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy hình ảnh chính thành công", image));
    }

    /**
     * GET /api/product-images/variant/{variantId}
     * Lấy hình ảnh của biến thể sản phẩm
     */
    @GetMapping("/variant/{variantId}")
    public ResponseEntity<ApiResponse<List<ProductImageDTO>>> getVariantImages(@PathVariable Integer variantId) {
        List<ProductImageDTO> images = imageService.getImagesByVariantId(variantId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách hình ảnh biến thể thành công", images));
    }

    /**
     * POST /api/product-images
     * Tạo hình ảnh mới
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('CREATE_PRODUCT', 'EDIT_PRODUCT')")
    public ResponseEntity<ApiResponse<ProductImageDTO>> createImage(@Valid @RequestBody ProductImageDTO dto) {
        ProductImageDTO created = imageService.createImage(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo hình ảnh thành công", created));
    }

    /**
     * PUT /api/product-images/{id}
     * Cập nhật hình ảnh
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('EDIT_PRODUCT')")
    public ResponseEntity<ApiResponse<ProductImageDTO>> updateImage(
            @PathVariable Integer id,
            @Valid @RequestBody ProductImageDTO dto) {
        ProductImageDTO updated = imageService.updateImage(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật hình ảnh thành công", updated));
    }

    /**
     * PUT /api/product-images/{id}/set-primary
     * Đặt hình ảnh làm chính
     */
    @PutMapping("/{id}/set-primary")
    @PreAuthorize("hasAnyAuthority('EDIT_PRODUCT')")
    public ResponseEntity<ApiResponse<Void>> setPrimaryImage(@PathVariable Integer id) {
        imageService.setPrimaryImage(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đặt hình ảnh chính thành công", null));
    }

    /**
     * PUT /api/product-images/{id}/display-order
     * Cập nhật thứ tự hiển thị
     */
    @PutMapping("/{id}/display-order")
    @PreAuthorize("hasAnyAuthority('EDIT_PRODUCT')")
    public ResponseEntity<ApiResponse<Void>> updateDisplayOrder(
            @PathVariable Integer id,
            @RequestParam Integer displayOrder) {
        imageService.updateDisplayOrder(id, displayOrder);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật thứ tự hiển thị thành công", null));
    }

    /**
     * DELETE /api/product-images/{id}
     * Xóa hình ảnh
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('DELETE_PRODUCT')")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Integer id) {
        imageService.deleteImage(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa hình ảnh thành công", null));
    }

    /**
     * DELETE /api/product-images/product/{productId}
     * Xóa tất cả hình ảnh của sản phẩm
     */
    @DeleteMapping("/product/{productId}")
    @PreAuthorize("hasAnyAuthority('DELETE_PRODUCT')")
    public ResponseEntity<ApiResponse<Void>> deleteAllProductImages(@PathVariable Integer productId) {
        imageService.deleteAllImagesByProductId(productId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa tất cả hình ảnh sản phẩm thành công", null));
    }

    /**
     * POST /api/product-images/batch
     * Tạo nhiều hình ảnh cùng lúc
     */
    @PostMapping("/batch")
    @PreAuthorize("hasAnyAuthority('CREATE_PRODUCT', 'EDIT_PRODUCT')")
    public ResponseEntity<ApiResponse<List<ProductImageDTO>>> createBatchImages(@Valid @RequestBody List<ProductImageDTO> dtos) {
        List<ProductImageDTO> created = imageService.createBatchImages(dtos);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo hình ảnh hàng loạt thành công", created));
    }

    /**
     * DELETE /api/product-images/batch
     * Xóa nhiều hình ảnh cùng lúc
     */
    @DeleteMapping("/batch")
    @PreAuthorize("hasAnyAuthority('DELETE_PRODUCT')")
    public ResponseEntity<ApiResponse<Void>> deleteBatchImages(@RequestParam List<Integer> imageIds) {
        imageService.deleteBatchImages(imageIds);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa hình ảnh hàng loạt thành công", null));
    }

    /**
     * PUT /api/product-images/reorder
     * Sắp xếp lại thứ tự hình ảnh
     */
    @PutMapping("/reorder")
    @PreAuthorize("hasAnyAuthority('EDIT_PRODUCT')")
    public ResponseEntity<ApiResponse<Void>> reorderImages(@RequestBody List<ProductImageDTO> images) {
        imageService.reorderImages(images);
        return ResponseEntity.ok(new ApiResponse<>(true, "Sắp xếp lại thứ tự hình ảnh thành công", null));
    }

    /**
     * POST /api/product-images/upload/{productId}
     * Upload nhiều file ảnh cùng lúc
     */
    @PostMapping("/upload/{productId}")
    @PreAuthorize("hasAnyAuthority('CREATE_PRODUCT', 'EDIT_PRODUCT')")
    public ResponseEntity<ApiResponse<List<ProductImageDTO>>> uploadImages(
            @PathVariable Integer productId,
            @RequestParam("files") MultipartFile[] files) {
        List<ProductImageDTO> created = imageService.uploadImages(productId, files);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Upload hình ảnh thành công", created));
    }
}