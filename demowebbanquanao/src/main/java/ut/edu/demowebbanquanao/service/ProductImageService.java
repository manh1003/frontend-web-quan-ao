package ut.edu.demowebbanquanao.service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ut.edu.demowebbanquanao.dto.ProductImageDTO;
import ut.edu.demowebbanquanao.entity.Product;
import ut.edu.demowebbanquanao.entity.ProductImage;
import ut.edu.demowebbanquanao.entity.ProductVariant;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.ProductImageRepository;
import ut.edu.demowebbanquanao.repository.ProductRepository;
import ut.edu.demowebbanquanao.repository.ProductVariantRepository;

@Service
public class ProductImageService {

    @Autowired
    private ProductImageRepository imageRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository variantRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Lấy tất cả hình ảnh của sản phẩm
     */
    public List<ProductImageDTO> getImagesByProductId(Integer productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        
        return imageRepository.findByProduct_ProductIdOrderByDisplayOrderAsc(productId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy hình ảnh theo ID
     */
    public ProductImageDTO getImageById(Integer imageId) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hình ảnh với ID: " + imageId));
        return convertToDTO(image);
    }

    /**
     * Lấy hình ảnh chính của sản phẩm
     */
    public ProductImageDTO getPrimaryImageByProductId(Integer productId) {
        ProductImage image = imageRepository.findByProduct_ProductIdAndIsPrimaryTrue(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm chưa có hình ảnh chính"));
        return convertToDTO(image);
    }

    /**
     * Lấy hình ảnh của biến thể sản phẩm
     */
    public List<ProductImageDTO> getImagesByVariantId(Integer variantId) {
        if (!variantRepository.existsById(variantId)) {
            throw new ResourceNotFoundException("Không tìm thấy biến thể sản phẩm với ID: " + variantId);
        }
        
        return imageRepository.findByVariant_VariantIdOrderByDisplayOrderAsc(variantId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Tạo hình ảnh mới
     */
    @Transactional
    public ProductImageDTO createImage(ProductImageDTO dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + dto.getProductId()));

        ProductVariant variant = null;
        if (dto.getVariantId() != null) {
            variant = variantRepository.findById(dto.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể sản phẩm với ID: " + dto.getVariantId()));
        }

        // Nếu đặt là hình ảnh chính, bỏ primary của các hình ảnh khác
        if (Boolean.TRUE.equals(dto.getIsPrimary())) {
            imageRepository.unsetPrimaryImageForProduct(dto.getProductId());
        }

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setVariant(variant);
        image.setImageUrl(dto.getImageUrl());
        image.setIsPrimary(dto.getIsPrimary() != null ? dto.getIsPrimary() : false);
        image.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);

        ProductImage saved = imageRepository.save(image);
        return convertToDTO(saved);
    }

    /**
     * Cập nhật hình ảnh
     */
    @Transactional
    public ProductImageDTO updateImage(Integer imageId, ProductImageDTO dto) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hình ảnh với ID: " + imageId));

        // Nếu đổi thành hình ảnh chính, bỏ primary của các hình ảnh khác
        if (Boolean.TRUE.equals(dto.getIsPrimary()) && !Boolean.TRUE.equals(image.getIsPrimary())) {
            imageRepository.unsetPrimaryImageForProduct(image.getProduct().getProductId());
        }

        image.setImageUrl(dto.getImageUrl());
        image.setIsPrimary(dto.getIsPrimary() != null ? dto.getIsPrimary() : image.getIsPrimary());
        image.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : image.getDisplayOrder());

        ProductImage updated = imageRepository.save(image);
        return convertToDTO(updated);
    }

    /**
     * Đặt hình ảnh làm chính
     */
    @Transactional
    public void setPrimaryImage(Integer imageId) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hình ảnh với ID: " + imageId));

        // Bỏ primary của các hình ảnh khác
        imageRepository.unsetPrimaryImageForProduct(image.getProduct().getProductId());

        image.setIsPrimary(true);
        imageRepository.save(image);
    }

    /**
     * Cập nhật thứ tự hiển thị hình ảnh
     */
    @Transactional
    public void updateDisplayOrder(Integer imageId, Integer displayOrder) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hình ảnh với ID: " + imageId));

        image.setDisplayOrder(displayOrder);
        imageRepository.save(image);
    }

    /**
     * Xóa hình ảnh
     */
    @Transactional
    public void deleteImage(Integer imageId) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hình ảnh với ID: " + imageId));

        imageRepository.delete(image);
    }

    /**
     * Xóa tất cả hình ảnh của sản phẩm
     */
    @Transactional
    public void deleteAllImagesByProductId(Integer productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        
        imageRepository.deleteByProduct_ProductId(productId);
    }

    /**
     * Tạo nhiều hình ảnh cùng lúc
     */
    @Transactional
    public List<ProductImageDTO> createBatchImages(List<ProductImageDTO> dtos) {
        List<ProductImageDTO> result = new ArrayList<>();
        for (ProductImageDTO dto : dtos) {
            result.add(createImage(dto));
        }
        return result;
    }

    /**
     * Xóa nhiều hình ảnh cùng lúc
     */
    @Transactional
    public void deleteBatchImages(List<Integer> imageIds) {
        for (Integer imageId : imageIds) {
            deleteImage(imageId);
        }
    }

    /**
     * Sắp xếp lại thứ tự hình ảnh
     */
    @Transactional
    public void reorderImages(List<ProductImageDTO> images) {
        for (ProductImageDTO dto : images) {
            if (dto.getImageId() != null && dto.getDisplayOrder() != null) {
                updateDisplayOrder(dto.getImageId(), dto.getDisplayOrder());
            }
        }
    }

    /**
     * Upload nhiều file ảnh cùng lúc
     */
    @Transactional
    public List<ProductImageDTO> uploadImages(Integer productId, org.springframework.web.multipart.MultipartFile[] files) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));

        List<ProductImageDTO> result = new ArrayList<>();
        
        for (org.springframework.web.multipart.MultipartFile file : files) {
            if (!file.isEmpty()) {
                try {
                    // Tạo tên file unique
                    String fileName = java.util.UUID.randomUUID().toString() + "_" +
                        org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename());
                    
                    // Tạo thư mục upload nếu chưa có
                    java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads");
                    if (!java.nio.file.Files.exists(uploadPath)) {
                        java.nio.file.Files.createDirectories(uploadPath);
                    }
                    
                    // Lưu file
                    java.nio.file.Path filePath = uploadPath.resolve(fileName);
                    java.nio.file.Files.copy(file.getInputStream(), filePath,
                        java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                    
                    // Tạo URL
                    String imageUrl = "/uploads/" + fileName;
                    
                    // Lưu vào database
                    ProductImage productImage = new ProductImage();
                    productImage.setProduct(product);
                    productImage.setImageUrl(imageUrl);
                    productImage.setIsPrimary(false);
                    productImage.setDisplayOrder(0);
                    ProductImage saved = imageRepository.save(productImage);
                    
                    result.add(convertToDTO(saved));
                    
                } catch (java.io.IOException e) {
                    throw new RuntimeException("Không thể lưu file: " + file.getOriginalFilename(), e);
                }
            }
        }
        
        return result;
    }

    /**
     * Convert Entity sang DTO
     */
    private ProductImageDTO convertToDTO(ProductImage image) {
        ProductImageDTO dto = new ProductImageDTO();
        dto.setImageId(image.getImageId());
        dto.setProductId(image.getProduct().getProductId());
        dto.setVariantId(image.getVariant() != null ? image.getVariant().getVariantId() : null);
        dto.setImageUrl(image.getImageUrl());
        dto.setIsPrimary(image.getIsPrimary());
        dto.setDisplayOrder(image.getDisplayOrder());
        dto.setCreatedAt(image.getCreatedAt() != null ? image.getCreatedAt().format(DATE_FORMATTER) : null);
        return dto;
    }
}