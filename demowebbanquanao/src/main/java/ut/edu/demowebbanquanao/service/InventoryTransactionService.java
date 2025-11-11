package ut.edu.demowebbanquanao.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ut.edu.demowebbanquanao.dto.InventoryTransactionDTO;
import ut.edu.demowebbanquanao.entity.InventoryTransaction;
import ut.edu.demowebbanquanao.entity.InventoryTransaction.TransactionType;
import ut.edu.demowebbanquanao.entity.ProductVariant;
import ut.edu.demowebbanquanao.entity.User;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.InventoryTransactionRepository;
import ut.edu.demowebbanquanao.repository.ProductVariantRepository;
import ut.edu.demowebbanquanao.repository.UserRepository;

@Service
@Transactional
public class InventoryTransactionService {

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private UserRepository userRepository;

    // Tạo transaction mới
    public InventoryTransactionDTO createTransaction(InventoryTransactionDTO dto) {
        ProductVariant variant = productVariantRepository.findById(dto.getVariantId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy variant với ID: " + dto.getVariantId()));

        // Lưu số lượng tồn kho trước khi thay đổi
        Integer stockBefore = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;

        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setVariant(variant);
        transaction.setTransactionType(TransactionType.valueOf(dto.getTransactionType()));
        transaction.setQuantity(dto.getQuantity());
        transaction.setStockBefore(stockBefore);
        transaction.setReferenceType(dto.getReferenceType());
        transaction.setReferenceId(dto.getReferenceId());
        transaction.setNotes(dto.getNotes());

        if (dto.getCreatedById() != null) {
            User user = userRepository.findById(dto.getCreatedById())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Không tìm thấy user với ID: " + dto.getCreatedById()));
            transaction.setCreatedBy(user);
        }

        // Cập nhật stock quantity trong variant
        Integer stockAfter = updateVariantStock(variant, transaction.getTransactionType(), transaction.getQuantity());
        transaction.setStockAfter(stockAfter);

        transaction = inventoryTransactionRepository.save(transaction);
        return convertToDTO(transaction);
    }

    // Cập nhật số lượng tồn kho và trả về số lượng sau khi cập nhật
    private Integer updateVariantStock(ProductVariant variant, TransactionType type, Integer quantity) {
        Integer currentStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        Integer newStock = currentStock;

        switch (type) {
            case IN:
                newStock = currentStock + quantity;
                variant.setStockQuantity(newStock);
                break;
            case OUT:
                newStock = currentStock - quantity;
                variant.setStockQuantity(newStock);
                break;
            case ADJUSTMENT:
                newStock = currentStock + quantity;
                variant.setStockQuantity(newStock);
                break;
        }

        productVariantRepository.save(variant);
        return newStock;
    }

    // Lấy tất cả transaction
    public List<InventoryTransactionDTO> getAllTransactions() {
        return inventoryTransactionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy transaction theo ID
    public InventoryTransactionDTO getTransactionById(Integer id) {
        InventoryTransaction transaction = inventoryTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy transaction với ID: " + id));
        return convertToDTO(transaction);
    }

    // Lấy transaction theo variant
    public List<InventoryTransactionDTO> getTransactionsByVariant(Integer variantId) {
        return inventoryTransactionRepository.findByVariantVariantIdOrderByCreatedAtDesc(variantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy transaction theo loại
    public List<InventoryTransactionDTO> getTransactionsByType(String type) {
        TransactionType transactionType = TransactionType.valueOf(type);
        return inventoryTransactionRepository.findByTransactionTypeOrderByCreatedAtDesc(transactionType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy transaction trong khoảng thời gian
    public List<InventoryTransactionDTO> getTransactionsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return inventoryTransactionRepository.findByDateRange(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy transaction theo reference
    public List<InventoryTransactionDTO> getTransactionsByReference(String referenceType, Integer referenceId) {
        return inventoryTransactionRepository
                .findByReferenceTypeAndReferenceIdOrderByCreatedAtDesc(referenceType, referenceId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy transaction theo user tạo
    public List<InventoryTransactionDTO> getTransactionsByCreatedBy(Integer userId) {
        return inventoryTransactionRepository.findByCreatedByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Tính tổng số lượng IN của variant
    public Integer calculateTotalInQuantity(Integer variantId) {
        return inventoryTransactionRepository.calculateTotalInQuantity(variantId);
    }

    // Tính tổng số lượng OUT của variant
    public Integer calculateTotalOutQuantity(Integer variantId) {
        return inventoryTransactionRepository.calculateTotalOutQuantity(variantId);
    }

    // Tính số lượng tồn kho hiện tại
    public Integer calculateCurrentStock(Integer variantId) {
        return inventoryTransactionRepository.calculateCurrentStock(variantId);
    }

    // Lấy transaction mới nhất của variant
    public InventoryTransactionDTO getLatestTransaction(Integer variantId) {
        InventoryTransaction transaction = inventoryTransactionRepository
                .findFirstByVariantVariantIdOrderByCreatedAtDesc(variantId);
        return transaction != null ? convertToDTO(transaction) : null;
    }

    // Xóa transaction (cẩn thận - nên có quyền admin)
    public void deleteTransaction(Integer id) {
        InventoryTransaction transaction = inventoryTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy transaction với ID: " + id));

        // Hoàn trả số lượng về variant
        ProductVariant variant = transaction.getVariant();
        Integer currentStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;

        switch (transaction.getTransactionType()) {
            case IN:
                variant.setStockQuantity(currentStock - transaction.getQuantity());
                break;
            case OUT:
                variant.setStockQuantity(currentStock + transaction.getQuantity());
                break;
            case ADJUSTMENT:
                variant.setStockQuantity(currentStock - transaction.getQuantity());
                break;
        }

        productVariantRepository.save(variant);
        inventoryTransactionRepository.deleteById(id);
    }

    // Convert Entity to DTO
    private InventoryTransactionDTO convertToDTO(InventoryTransaction transaction) {
        InventoryTransactionDTO dto = new InventoryTransactionDTO();
        dto.setTransactionId(transaction.getTransactionId());
        dto.setVariantId(transaction.getVariant().getVariantId());
        // ProductVariant không có variantName, chỉ có color và size
        String variantName = transaction.getVariant().getColor() + " - " + transaction.getVariant().getSize();
        dto.setVariantName(variantName);
        dto.setVariantSku(transaction.getVariant().getVariantSku());
        dto.setTransactionType(transaction.getTransactionType().name());
        dto.setQuantity(transaction.getQuantity());
        dto.setStockBefore(transaction.getStockBefore());
        dto.setStockAfter(transaction.getStockAfter());
        dto.setReferenceType(transaction.getReferenceType());
        dto.setReferenceId(transaction.getReferenceId());
        dto.setNotes(transaction.getNotes());

        if (transaction.getCreatedBy() != null) {
            dto.setCreatedById(transaction.getCreatedBy().getUserId());
            dto.setCreatedByName(transaction.getCreatedBy().getFullName());
        }

        dto.setCreatedAt(transaction.getCreatedAt());
        return dto;
    }
}