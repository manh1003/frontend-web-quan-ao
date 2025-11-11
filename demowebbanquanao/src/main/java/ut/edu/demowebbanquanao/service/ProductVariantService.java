package ut.edu.demowebbanquanao.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import ut.edu.demowebbanquanao.dto.ProductVariantDTO;
import ut.edu.demowebbanquanao.entity.Product;
import ut.edu.demowebbanquanao.entity.ProductVariant;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.ProductRepository;
import ut.edu.demowebbanquanao.repository.ProductVariantRepository;

@Service
@RequiredArgsConstructor
public class ProductVariantService {
    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;

    public List<ProductVariantDTO> getAllVariants() {
        return variantRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProductVariantDTO> getVariantsByProductId(Integer productId) {
        return variantRepository.findByProductId(productId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProductVariantDTO> getLowStockVariants() {
        return variantRepository.findByStockQuantityLessThanMinStockThreshold().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProductVariantDTO getVariantById(Integer id) {
        return toDTO(variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product Variant không tồn tại với ID: " + id)));
    }

    @Transactional
    public ProductVariantDTO createVariant(ProductVariantDTO dto) {
        if (!productRepository.existsById(dto.getProductId())) {
            throw new ResourceNotFoundException("Product không tồn tại với ID: " + dto.getProductId());
        }
        ProductVariant variant = toEntity(dto);
        return toDTO(variantRepository.save(variant));
    }

    @Transactional
    public ProductVariantDTO updateVariant(Integer id, ProductVariantDTO dto) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product Variant không tồn tại với ID: " + id));

        variant.setColor(dto.getColor());
        variant.setSize(dto.getSize());
        variant.setVariantSku(dto.getVariantSku());
        variant.setRetailPrice(dto.getPrice());
        variant.setSalePrice(dto.getSalePrice());
        variant.setStockQuantity(dto.getStockQuantity());
        variant.setMinStockThreshold(dto.getMinStockThreshold());
        variant.setIsActive(dto.getIsActive());

        return toDTO(variantRepository.save(variant));
    }

    @Transactional
    public void deleteVariant(Integer id) {
        if (!variantRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product Variant không tồn tại với ID: " + id);
        }
        variantRepository.deleteById(id);
    }

    private ProductVariantDTO toDTO(ProductVariant entity) {
        Product product = productRepository.findById(entity.getProductId()).orElse(null);
        return new ProductVariantDTO(
            entity.getVariantId(),
            entity.getProductId(),
            product != null ? product.getProductName() : null,
            product != null ? product.getSku() : null,
            entity.getVariantSku(),
            entity.getSize(),
            entity.getColor(),
            entity.getRetailPrice(),
            entity.getSalePrice(),
            entity.getStockQuantity(),
            entity.getMinStockThreshold(),
            entity.getIsActive()
        );
    }

    private ProductVariant toEntity(ProductVariantDTO dto) {
        ProductVariant variant = new ProductVariant();
        variant.setProductId(dto.getProductId());
        variant.setColor(dto.getColor());
        variant.setSize(dto.getSize());
        variant.setVariantSku(dto.getVariantSku());
        variant.setRetailPrice(dto.getPrice());
        variant.setSalePrice(dto.getSalePrice());
        variant.setStockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 0);
        variant.setMinStockThreshold(dto.getMinStockThreshold() != null ? dto.getMinStockThreshold() : 10);
        variant.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return variant;
    }
}
