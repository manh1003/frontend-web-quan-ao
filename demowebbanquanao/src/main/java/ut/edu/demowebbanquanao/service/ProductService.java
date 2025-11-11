package ut.edu.demowebbanquanao.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import ut.edu.demowebbanquanao.dto.BrandDTO;
import ut.edu.demowebbanquanao.dto.ProductCategoryDTO;
import ut.edu.demowebbanquanao.dto.ProductDTO;
import ut.edu.demowebbanquanao.dto.ProductImageDTO;
import ut.edu.demowebbanquanao.dto.ProductVariantDTO;
import ut.edu.demowebbanquanao.entity.Product;
import ut.edu.demowebbanquanao.entity.ProductImage;
import ut.edu.demowebbanquanao.entity.ProductVariant;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.BrandRepository;
import ut.edu.demowebbanquanao.repository.ProductCategoryRepository;
import ut.edu.demowebbanquanao.repository.ProductImageRepository;
import ut.edu.demowebbanquanao.repository.ProductRepository;
import ut.edu.demowebbanquanao.repository.ProductVariantRepository;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final BrandRepository brandRepository;
    private final ProductCategoryRepository productCategoryRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.base.url:http://localhost:8080}")
    private String baseUrl;

    public List<ProductDTO> getAllProducts() {
        List<Product> products = productRepository.findByIsActiveTrue();
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getAllProducts(String search, Integer categoryId, Integer brandId, Boolean isActive) {
        List<Product> products;
        
        if (search != null || categoryId != null || brandId != null || isActive != null) {
            products = productRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
            
            // Apply filters
            products = products.stream()
                .filter(p -> isActive == null || p.getIsActive().equals(isActive))
                .filter(p -> categoryId == null || categoryId.equals(p.getCategoryId()))
                .filter(p -> brandId == null || brandId.equals(p.getBrandId()))
                .filter(p -> search == null ||
                    p.getProductName().toLowerCase().contains(search.toLowerCase()) ||
                    p.getSku().toLowerCase().contains(search.toLowerCase()))
                .collect(Collectors.toList());
        } else {
            products = productRepository.findByIsActiveTrue();
        }
        
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        return convertToDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = convertToEntity(dto);
        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }

    @Transactional
    public ProductDTO updateProduct(Integer id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

        // Cập nhật tất cả các trường
        if (dto.getSku() != null) {
            product.setSku(dto.getSku());
        }
        if (dto.getProductName() != null) {
            product.setProductName(dto.getProductName());
        }
        product.setCategoryId(dto.getCategoryId());
        product.setBrandId(dto.getBrandId());
        product.setMaterial(dto.getMaterial());
        product.setDescription(dto.getDescription());
        product.setCareInstructions(dto.getCareInstructions());
        if (dto.getIsActive() != null) {
            product.setIsActive(dto.getIsActive());
        }

        Product updated = productRepository.save(product);
        return convertToDTO(updated);
    }

    @Transactional
    public ProductDTO toggleProductStatus(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        
        product.setIsActive(!product.getIsActive());
        Product updated = productRepository.save(product);
        return convertToDTO(updated);
    }

    public List<String> uploadProductImages(Integer productId, org.springframework.web.multipart.MultipartFile[] files) {
        // Kiểm tra sản phẩm tồn tại
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));

        List<String> imageUrls = new ArrayList<>();
        
        for (org.springframework.web.multipart.MultipartFile file : files) {
            if (!file.isEmpty()) {
                try {
                    // Tạo tên file unique
                    String fileName = java.util.UUID.randomUUID().toString() + "_" +
                        org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename());
                    
                    // Tạo thư mục upload nếu chưa có
                    java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
                    if (!java.nio.file.Files.exists(uploadPath)) {
                        java.nio.file.Files.createDirectories(uploadPath);
                    }
                    
                    // Lưu file
                    java.nio.file.Path filePath = uploadPath.resolve(fileName);
                    java.nio.file.Files.copy(file.getInputStream(), filePath,
                        java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                    
                    // Tạo URL
                    String imageUrl = baseUrl + "/uploads/" + fileName;
                    imageUrls.add(imageUrl);
                    
                    // Lưu vào database
                    ProductImage productImage = new ProductImage();
                    productImage.setProduct(product);
                    productImage.setImageUrl(imageUrl);
                    productImage.setIsPrimary(false);
                    productImage.setDisplayOrder(0);
                    productImageRepository.save(productImage);
                    
                } catch (java.io.IOException e) {
                    throw new RuntimeException("Không thể lưu file: " + file.getOriginalFilename(), e);
                }
            }
        }
        
        return imageUrls;
    }

    @Transactional
    public void deleteProduct(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        product.setIsActive(false);
        productRepository.save(product);
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setProductId(product.getProductId());
        dto.setSku(product.getSku());
        dto.setProductName(product.getProductName());
        dto.setCategoryId(product.getCategoryId());
        dto.setBrandId(product.getBrandId());
        dto.setMaterial(product.getMaterial());
        dto.setDescription(product.getDescription());
        dto.setCareInstructions(product.getCareInstructions());
        dto.setIsActive(product.getIsActive());
        dto.setCreatedBy(product.getCreatedBy());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        
        // Load variants
        List<ProductVariant> variants = productVariantRepository.findByProductId(product.getProductId());
        dto.setVariants(variants.stream()
            .map(this::convertVariantToDTO)
            .collect(Collectors.toList()));
        
        // Load images
        List<ProductImage> images = productImageRepository.findByProduct_ProductIdOrderByDisplayOrderAsc(product.getProductId());
        dto.setImages(images.stream()
            .map(this::convertImageToDTO)
            .collect(Collectors.toList()));
        
        // Load brand
        if (product.getBrandId() != null) {
            brandRepository.findById(product.getBrandId()).ifPresent(brand -> {
                BrandDTO brandDTO = new BrandDTO();
                brandDTO.setBrandId(brand.getBrandId());
                brandDTO.setBrandName(brand.getBrandName());
                brandDTO.setDescription(brand.getDescription());
                brandDTO.setCountry(brand.getCountry());
                brandDTO.setWebsite(brand.getWebsite());
                brandDTO.setIsActive(brand.getIsActive());
                dto.setBrand(brandDTO);
                dto.setBrandName(brand.getBrandName());
            });
        }
        
        // Load category
        if (product.getCategoryId() != null) {
            productCategoryRepository.findById(product.getCategoryId()).ifPresent(category -> {
                ProductCategoryDTO categoryDTO = new ProductCategoryDTO();
                categoryDTO.setCategoryId(category.getCategoryId());
                categoryDTO.setCategoryName(category.getCategoryName());
                categoryDTO.setParentCategoryId(category.getParentCategoryId());
                categoryDTO.setDescription(category.getDescription());
                categoryDTO.setIsActive(category.getIsActive());
                dto.setCategory(categoryDTO);
                dto.setCategoryName(category.getCategoryName());
            });
        }
        
        return dto;
    }
    
    private ProductVariantDTO convertVariantToDTO(ProductVariant variant) {
        ProductVariantDTO dto = new ProductVariantDTO();
        dto.setVariantId(variant.getVariantId());
        dto.setProductId(variant.getProductId());
        dto.setVariantSku(variant.getVariantSku());
        dto.setSize(variant.getSize());
        dto.setColor(variant.getColor());
        dto.setPrice(variant.getRetailPrice());
        dto.setSalePrice(variant.getSalePrice());
        dto.setStockQuantity(variant.getStockQuantity());
        dto.setMinStockThreshold(variant.getMinStockThreshold());
        dto.setIsActive(variant.getIsActive());
        return dto;
    }
    
    private ProductImageDTO convertImageToDTO(ProductImage image) {
        ProductImageDTO dto = new ProductImageDTO();
        dto.setImageId(image.getImageId());
        dto.setProductId(image.getProduct() != null ? image.getProduct().getProductId() : null);
        dto.setVariantId(image.getVariant() != null ? image.getVariant().getVariantId() : null);
        dto.setImageUrl(image.getImageUrl());
        dto.setIsPrimary(image.getIsPrimary());
        dto.setDisplayOrder(image.getDisplayOrder());
        return dto;
    }

    private Product convertToEntity(ProductDTO dto) {
        Product product = new Product();
        product.setSku(dto.getSku());
        product.setProductName(dto.getProductName());
        product.setCategoryId(dto.getCategoryId());
        product.setBrandId(dto.getBrandId());
        product.setMaterial(dto.getMaterial());
        product.setDescription(dto.getDescription());
        product.setCareInstructions(dto.getCareInstructions());
        return product;
    }
}
