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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ut.edu.demowebbanquanao.dto.ProductDTO;
import ut.edu.demowebbanquanao.exception.ApiResponse;
import ut.edu.demowebbanquanao.service.ProductService;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer brandId,
            @RequestParam(required = false) Boolean isActive) {
        List<ProductDTO> products = productService.getAllProducts(search, categoryId, brandId, isActive);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductById(@PathVariable Integer id) {
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('CREATE_PRODUCT', 'ADMIN')")
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(@Valid @RequestBody ProductDTO productDTO) {
        ProductDTO created = productService.createProduct(productDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo sản phẩm thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('EDIT_PRODUCT', 'ADMIN')")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable Integer id,
            @Valid @RequestBody ProductDTO productDTO) {
        ProductDTO updated = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('DELETE_PRODUCT', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công", null));
    }

    @PostMapping("/{id}/upload-images")
    @PreAuthorize("hasAnyAuthority('EDIT_PRODUCT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> uploadProductImages(
            @PathVariable Integer id,
            @RequestParam("files") MultipartFile[] files) {
        List<String> imageUrls = productService.uploadProductImages(id, files);
        return ResponseEntity.ok(ApiResponse.success("Upload ảnh thành công", imageUrls));
    }

    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyAuthority('EDIT_PRODUCT', 'ADMIN')")
    public ResponseEntity<ApiResponse<ProductDTO>> toggleProductStatus(@PathVariable Integer id) {
        ProductDTO updated = productService.toggleProductStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái sản phẩm thành công", updated));
    }
}
