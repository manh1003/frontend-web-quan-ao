package ut.edu.demowebbanquanao.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ut.edu.demowebbanquanao.dto.PurchaseOrderDTO;
import ut.edu.demowebbanquanao.dto.PurchaseOrderDetailDTO;
import ut.edu.demowebbanquanao.entity.ProductVariant;
import ut.edu.demowebbanquanao.entity.PurchaseOrder;
import ut.edu.demowebbanquanao.entity.PurchaseOrder.POStatus;
import ut.edu.demowebbanquanao.entity.PurchaseOrderDetail;
import ut.edu.demowebbanquanao.entity.Supplier;
import ut.edu.demowebbanquanao.entity.User;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.ProductVariantRepository;
import ut.edu.demowebbanquanao.repository.PurchaseOrderDetailRepository;
import ut.edu.demowebbanquanao.repository.PurchaseOrderRepository;
import ut.edu.demowebbanquanao.repository.SupplierRepository;
import ut.edu.demowebbanquanao.repository.UserRepository;

@Service
public class PurchaseOrderService {

    @Autowired
    private PurchaseOrderRepository poRepository;

    @Autowired
    private PurchaseOrderDetailRepository poDetailRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductVariantRepository variantRepository;

    @Autowired
    private UserRepository userRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Lấy tất cả đơn nhập hàng
     */
    public List<PurchaseOrderDTO> getAllPurchaseOrders() {
        return poRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy đơn nhập hàng theo ID
     */
    public PurchaseOrderDTO getPurchaseOrderById(Integer poId) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn nhập hàng với ID: " + poId));
        return convertToDTOWithDetails(po);
    }

    /**
     * Lấy đơn nhập hàng theo số PO
     */
    public PurchaseOrderDTO getPurchaseOrderByNumber(String poNumber) {
        PurchaseOrder po = poRepository.findByPoNumber(poNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn nhập hàng với số: " + poNumber));
        return convertToDTOWithDetails(po);
    }

    /**
     * Lấy đơn nhập hàng theo nhà cung cấp
     */
    public List<PurchaseOrderDTO> getPurchaseOrdersBySupplier(Integer supplierId) {
        return poRepository.findBySupplier_SupplierId(supplierId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy đơn nhập hàng theo trạng thái
     */
    public List<PurchaseOrderDTO> getPurchaseOrdersByStatus(String status) {
        POStatus poStatus = POStatus.valueOf(status.toUpperCase());
        return poRepository.findByStatus(poStatus)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Tạo đơn nhập hàng mới
     */
    @Transactional
    public PurchaseOrderDTO createPurchaseOrder(PurchaseOrderDTO dto, Integer userId) {
        // Kiểm tra số PO đã tồn tại chưa
        if (poRepository.existsByPoNumber(dto.getPoNumber())) {
            throw new IllegalArgumentException("Số đơn nhập hàng đã tồn tại: " + dto.getPoNumber());
        }

        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhà cung cấp với ID: " + dto.getSupplierId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(dto.getPoNumber());
        po.setSupplier(supplier);
        po.setOrderDate(LocalDate.parse(dto.getOrderDate(), DATE_FORMATTER));
        po.setExpectedDate(dto.getExpectedDate() != null ? LocalDate.parse(dto.getExpectedDate(), DATE_FORMATTER) : null);
        po.setStatus(POStatus.PENDING);
        po.setNotes(dto.getNotes());
        po.setCreatedBy(user);

        // Tính tổng tiền
        BigDecimal totalAmount = BigDecimal.ZERO;
        if (dto.getDetails() != null && !dto.getDetails().isEmpty()) {
            for (PurchaseOrderDetailDTO detailDTO : dto.getDetails()) {
                BigDecimal itemTotal = detailDTO.getUnitPrice().multiply(BigDecimal.valueOf(detailDTO.getQuantity()));
                totalAmount = totalAmount.add(itemTotal);
            }
        }
        po.setTotalAmount(totalAmount);

        PurchaseOrder savedPO = poRepository.save(po);

        // Lưu chi tiết đơn hàng
        if (dto.getDetails() != null && !dto.getDetails().isEmpty()) {
            for (PurchaseOrderDetailDTO detailDTO : dto.getDetails()) {
                ProductVariant variant = variantRepository.findById(detailDTO.getVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể sản phẩm với ID: " + detailDTO.getVariantId()));

                PurchaseOrderDetail detail = new PurchaseOrderDetail();
                detail.setPurchaseOrder(savedPO);
                detail.setVariant(variant);
                detail.setQuantity(detailDTO.getQuantity());
                detail.setUnitPrice(detailDTO.getUnitPrice());
                detail.setReceivedQuantity(0);

                poDetailRepository.save(detail);
            }
        }

        return convertToDTOWithDetails(savedPO);
    }

    /**
     * Cập nhật đơn nhập hàng
     */
    @Transactional
    public PurchaseOrderDTO updatePurchaseOrder(Integer poId, PurchaseOrderDTO dto) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn nhập hàng với ID: " + poId));

        // Chỉ cho phép cập nhật khi đơn ở trạng thái PENDING
        if (po.getStatus() != POStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể cập nhật đơn nhập hàng ở trạng thái PENDING");
        }

        if (dto.getExpectedDate() != null) {
            po.setExpectedDate(LocalDate.parse(dto.getExpectedDate(), DATE_FORMATTER));
        }
        po.setNotes(dto.getNotes());

        PurchaseOrder updated = poRepository.save(po);
        return convertToDTOWithDetails(updated);
    }

    /**
     * Phê duyệt đơn nhập hàng
     */
    @Transactional
    public void approvePurchaseOrder(Integer poId) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn nhập hàng với ID: " + poId));

        if (po.getStatus() != POStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể phê duyệt đơn nhập hàng ở trạng thái PENDING");
        }

        po.setStatus(POStatus.APPROVED);
        poRepository.save(po);
    }

    /**
     * Nhận hàng
     */
    @Transactional
    public void receivePurchaseOrder(Integer poId, LocalDate receivedDate) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn nhập hàng với ID: " + poId));

        if (po.getStatus() != POStatus.APPROVED) {
            throw new IllegalStateException("Chỉ có thể nhận hàng khi đơn đã được phê duyệt");
        }

        po.setReceivedDate(receivedDate);
        po.setStatus(POStatus.RECEIVED);
        poRepository.save(po);
    }

    /**
     * Hủy đơn nhập hàng
     */
    @Transactional
    public void cancelPurchaseOrder(Integer poId) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn nhập hàng với ID: " + poId));

        if (po.getStatus() == POStatus.RECEIVED) {
            throw new IllegalStateException("Không thể hủy đơn nhập hàng đã nhận");
        }

        po.setStatus(POStatus.CANCELLED);
        poRepository.save(po);
    }

    /**
     * Convert Entity sang DTO
     */
    private PurchaseOrderDTO convertToDTO(PurchaseOrder po) {
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        dto.setPoId(po.getPoId());
        dto.setPoNumber(po.getPoNumber());
        dto.setSupplierId(po.getSupplier().getSupplierId());
        dto.setSupplierName(po.getSupplier().getSupplierName());
        dto.setOrderDate(po.getOrderDate().format(DATE_FORMATTER));
        dto.setExpectedDate(po.getExpectedDate() != null ? po.getExpectedDate().format(DATE_FORMATTER) : null);
        dto.setReceivedDate(po.getReceivedDate() != null ? po.getReceivedDate().format(DATE_FORMATTER) : null);
        dto.setTotalAmount(po.getTotalAmount());
        dto.setStatus(po.getStatus().name());
        dto.setNotes(po.getNotes());
        dto.setCreatedBy(po.getCreatedBy() != null ? po.getCreatedBy().getUserId() : null);
        dto.setCreatedByName(po.getCreatedBy() != null ? po.getCreatedBy().getFullName() : null);
        dto.setCreatedAt(po.getCreatedAt() != null ? po.getCreatedAt().format(DATETIME_FORMATTER) : null);
        dto.setUpdatedAt(po.getUpdatedAt() != null ? po.getUpdatedAt().format(DATETIME_FORMATTER) : null);
        return dto;
    }

    /**
     * Convert Entity sang DTO với chi tiết
     */
    private PurchaseOrderDTO convertToDTOWithDetails(PurchaseOrder po) {
        PurchaseOrderDTO dto = convertToDTO(po);
        
        List<PurchaseOrderDetail> details = poDetailRepository.findByPurchaseOrder_PoId(po.getPoId());
        List<PurchaseOrderDetailDTO> detailDTOs = details.stream()
                .map(this::convertDetailToDTO)
                .collect(Collectors.toList());
        
        dto.setDetails(detailDTOs);
        return dto;
    }

    /**
     * Convert Detail Entity sang DTO
     */
    private PurchaseOrderDetailDTO convertDetailToDTO(PurchaseOrderDetail detail) {
        PurchaseOrderDetailDTO dto = new PurchaseOrderDetailDTO();
        dto.setPoDetailId(detail.getPoDetailId());
        dto.setPoId(detail.getPurchaseOrder().getPoId());
        dto.setVariantId(detail.getVariant().getVariantId());
        dto.setVariantSku(detail.getVariant().getVariantSku());
        dto.setColor(detail.getVariant().getColor());
        dto.setSize(detail.getVariant().getSize());
        dto.setQuantity(detail.getQuantity());
        dto.setUnitPrice(detail.getUnitPrice());
        dto.setTotalPrice(detail.getTotalPrice());
        dto.setReceivedQuantity(detail.getReceivedQuantity());
        return dto;
    }
}