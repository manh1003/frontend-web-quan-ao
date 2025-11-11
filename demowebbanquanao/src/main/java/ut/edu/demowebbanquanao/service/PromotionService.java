package ut.edu.demowebbanquanao.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ut.edu.demowebbanquanao.dto.PromotionDTO;
import ut.edu.demowebbanquanao.dto.PromotionProductDTO;
import ut.edu.demowebbanquanao.entity.Product;
import ut.edu.demowebbanquanao.entity.Promotion;
import ut.edu.demowebbanquanao.entity.Promotion.PromotionType;
import ut.edu.demowebbanquanao.entity.PromotionProduct;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.ProductRepository;
import ut.edu.demowebbanquanao.repository.PromotionProductRepository;
import ut.edu.demowebbanquanao.repository.PromotionRepository;

@Service
@Transactional
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private PromotionProductRepository promotionProductRepository;

    @Autowired
    private ProductRepository productRepository;

    public PromotionDTO createPromotion(PromotionDTO dto) {
        if (promotionRepository.existsByPromotionNameIgnoreCase(dto.getPromotionName())) {
            throw new IllegalArgumentException("Tên khuyến mãi đã tồn tại");
        }

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }

        Promotion promotion = new Promotion();
        promotion.setPromotionName(dto.getPromotionName());
        promotion.setDescription(dto.getDescription());
        promotion.setPromotionType(PromotionType.valueOf(dto.getPromotionType()));
        promotion.setStartDate(dto.getStartDate());
        promotion.setEndDate(dto.getEndDate());
        promotion.setIsActive(dto.getIsActive());

        promotion = promotionRepository.save(promotion);

        if (dto.getPromotionProducts() != null && !dto.getPromotionProducts().isEmpty()) {
            for (PromotionProductDTO ppDto : dto.getPromotionProducts()) {
                addProductToPromotion(promotion.getPromotionId(), ppDto);
            }
        }

        return convertToDTO(promotionRepository.findById(promotion.getPromotionId()).get());
    }

    public PromotionDTO updatePromotion(Integer id, PromotionDTO dto) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy promotion với ID: " + id));

        if (!promotion.getPromotionName().equalsIgnoreCase(dto.getPromotionName()) &&
            promotionRepository.existsByPromotionNameIgnoreCase(dto.getPromotionName())) {
            throw new IllegalArgumentException("Tên khuyến mãi đã tồn tại");
        }

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }

        promotion.setPromotionName(dto.getPromotionName());
        promotion.setDescription(dto.getDescription());
        promotion.setPromotionType(PromotionType.valueOf(dto.getPromotionType()));
        promotion.setStartDate(dto.getStartDate());
        promotion.setEndDate(dto.getEndDate());
        promotion.setIsActive(dto.getIsActive());

        promotion = promotionRepository.save(promotion);
        return convertToDTO(promotion);
    }

    public PromotionProductDTO addProductToPromotion(Integer promotionId, PromotionProductDTO dto) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy promotion với ID: " + promotionId));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + dto.getProductId()));

        if (promotionProductRepository.existsByPromotionPromotionIdAndProductProductId(promotionId, dto.getProductId())) {
            throw new IllegalArgumentException("Sản phẩm đã có trong chương trình khuyến mãi này");
        }

        PromotionProduct promotionProduct = new PromotionProduct();
        promotionProduct.setPromotion(promotion);
        promotionProduct.setProduct(product);
        promotionProduct.setDiscountPercentage(dto.getDiscountPercentage());
        promotionProduct.setDiscountFixedAmount(dto.getDiscountFixedAmount());
        promotionProduct.setMinQuantity(dto.getMinQuantity());
        promotionProduct.setMaxQuantity(dto.getMaxQuantity());

        promotionProduct = promotionProductRepository.save(promotionProduct);
        return convertToPromotionProductDTO(promotionProduct);
    }

    public void removeProductFromPromotion(Integer promotionId, Integer productId) {
        PromotionProduct promotionProduct = promotionProductRepository
                .findByPromotionPromotionIdAndProductProductId(promotionId, productId);

        if (promotionProduct == null) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm trong promotion");
        }

        promotionProductRepository.delete(promotionProduct);
    }

    public List<PromotionDTO> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PromotionDTO getPromotionById(Integer id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy promotion với ID: " + id));
        return convertToDTO(promotion);
    }

    public List<PromotionDTO> getActivePromotions() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findActivePromotions(now).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PromotionDTO> getUpcomingPromotions() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findUpcomingPromotions(now).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PromotionDTO> getExpiredPromotions() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findExpiredPromotions(now).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PromotionDTO> getPromotionsByType(String type) {
        PromotionType promotionType = PromotionType.valueOf(type);
        return promotionRepository.findByPromotionType(promotionType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PromotionDTO> getPromotionsByStatus(Boolean isActive) {
        return promotionRepository.findByIsActive(isActive).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PromotionProductDTO> getProductsInPromotion(Integer promotionId) {
        return promotionProductRepository.findByPromotionPromotionId(promotionId).stream()
                .map(this::convertToPromotionProductDTO)
                .collect(Collectors.toList());
    }

    public PromotionDTO togglePromotionStatus(Integer id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy promotion với ID: " + id));

        promotion.setIsActive(!promotion.getIsActive());
        promotion = promotionRepository.save(promotion);
        return convertToDTO(promotion);
    }

    public void deletePromotion(Integer id) {
        if (!promotionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy promotion với ID: " + id);
        }
        promotionRepository.deleteById(id);
    }

    private PromotionDTO convertToDTO(Promotion promotion) {
        PromotionDTO dto = new PromotionDTO();
        dto.setPromotionId(promotion.getPromotionId());
        dto.setPromotionName(promotion.getPromotionName());
        dto.setDescription(promotion.getDescription());
        dto.setPromotionType(promotion.getPromotionType().name());
        dto.setStartDate(promotion.getStartDate());
        dto.setEndDate(promotion.getEndDate());
        dto.setIsActive(promotion.getIsActive());
        dto.setCreatedAt(promotion.getCreatedAt());

        List<PromotionProductDTO> products = promotion.getPromotionProducts().stream()
                .map(this::convertToPromotionProductDTO)
                .collect(Collectors.toList());
        dto.setPromotionProducts(products);

        return dto;
    }

    private PromotionProductDTO convertToPromotionProductDTO(PromotionProduct pp) {
        PromotionProductDTO dto = new PromotionProductDTO();
        dto.setPromotionProductId(pp.getPromotionProductId());
        dto.setPromotionId(pp.getPromotion().getPromotionId());
        dto.setPromotionName(pp.getPromotion().getPromotionName());
        dto.setProductId(pp.getProduct().getProductId());
        dto.setProductName(pp.getProduct().getProductName());
        dto.setDiscountPercentage(pp.getDiscountPercentage());
        dto.setDiscountFixedAmount(pp.getDiscountFixedAmount());
        dto.setMinQuantity(pp.getMinQuantity());
        dto.setMaxQuantity(pp.getMaxQuantity());
        dto.setCreatedAt(pp.getCreatedAt());
        return dto;
    }
}