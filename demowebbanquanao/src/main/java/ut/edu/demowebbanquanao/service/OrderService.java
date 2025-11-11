package ut.edu.demowebbanquanao.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ut.edu.demowebbanquanao.dto.CustomerAddressDTO;
import ut.edu.demowebbanquanao.dto.CustomerDTO;
import ut.edu.demowebbanquanao.dto.InventoryTransactionDTO;
import ut.edu.demowebbanquanao.dto.OrderDTO;
import ut.edu.demowebbanquanao.dto.OrderDetailDTO;
import ut.edu.demowebbanquanao.entity.Customer;
import ut.edu.demowebbanquanao.entity.CustomerAddress;
import ut.edu.demowebbanquanao.entity.Order;
import ut.edu.demowebbanquanao.entity.OrderDetail;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.CustomerAddressRepository;
import ut.edu.demowebbanquanao.repository.CustomerRepository;
import ut.edu.demowebbanquanao.repository.OrderDetailRepository;
import ut.edu.demowebbanquanao.repository.OrderRepository;
import ut.edu.demowebbanquanao.repository.ProductRepository;
import ut.edu.demowebbanquanao.repository.ProductVariantRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CustomerRepository customerRepository;
    private final CustomerAddressRepository customerAddressRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final InventoryTransactionService inventoryTransactionService;

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrderById(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));
        return convertToDTO(order);
    }

    public List<OrderDTO> getOrdersByCustomerId(Integer customerId) {
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO createOrder(OrderDTO dto) {
        // 1. Lưu order
        Order order = convertToEntity(dto);
        Order saved = orderRepository.save(order);

        // 2. Lưu order details
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            for (OrderDetailDTO itemDto : dto.getItems()) {
                OrderDetail detail = new OrderDetail();
                detail.setOrderId(saved.getOrderId());
                detail.setVariantId(itemDto.getVariantId());
                detail.setQuantity(itemDto.getQuantity());
                detail.setUnitPrice(itemDto.getUnitPrice());
                detail.setDiscountAmount(
                        itemDto.getDiscountAmount() != null ? itemDto.getDiscountAmount() : java.math.BigDecimal.ZERO);
                orderDetailRepository.save(detail);
            }
        }

        // 3. Load lại order với details
        OrderDTO result = convertToDTO(saved);
        List<OrderDetail> details = orderDetailRepository.findByOrderId(saved.getOrderId());
        result.setItems(details.stream()
                .map(this::convertDetailToDTO)
                .collect(Collectors.toList()));

        return result;
    }

    @Transactional
    public OrderDTO updateOrderStatus(Integer id, String status) {
        return updateOrderStatus(id, status, null, null);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Integer id, String status, String cancellationReason, String returnReason) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));

        Order.OrderStatus oldStatus = order.getStatus();
        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status.toUpperCase());

        // Chỉ cập nhật nếu trạng thái thực sự thay đổi
        if (oldStatus == newStatus) {
            return convertToDTO(order);
        }

        // Cập nhật trạng thái
        order.setStatus(newStatus);

        // Lưu lý do hủy/hoàn trả nếu có
        if (newStatus == Order.OrderStatus.CANCELLED && cancellationReason != null) {
            order.setCancellationReason(cancellationReason);
        }
        if (newStatus == Order.OrderStatus.RETURNED && returnReason != null) {
            order.setReturnReason(returnReason);
        }

        // Xử lý các logic nghiệp vụ khi thay đổi trạng thái
        // Quan trọng: handleOrderStatusChange có thể thay đổi trạng thái thanh toán, v.v.
        handleOrderStatusChange(order, oldStatus, newStatus);

        // Lưu lại tất cả thay đổi vào DB. Thao tác này sẽ kích hoạt @PreUpdate
        // và cập nhật trường updatedAt một cách chính xác.
        Order updatedOrder = orderRepository.save(order);

        return convertToDTO(updatedOrder);
    }

    /**
     * Xử lý logic nghiệp vụ khi đơn hàng thay đổi trạng thái
     */
    private void handleOrderStatusChange(Order order, Order.OrderStatus oldStatus, Order.OrderStatus newStatus) {
        log.info("Đơn hàng #{} chuyển từ {} sang {}", order.getOrderNumber(), oldStatus, newStatus);

        // Khi đơn hàng được xác nhận -> Giữ hàng trong kho (reserve stock)
        if (newStatus == Order.OrderStatus.CONFIRMED && oldStatus == Order.OrderStatus.PENDING) {
            reserveStock(order);
        }

        // Khi đơn hàng được giao thành công -> Trừ kho + Cập nhật khách hàng + Cập nhật thanh toán
        if (newStatus == Order.OrderStatus.DELIVERED) {
            processDeliveredOrder(order);
        }

        // Khi đơn hàng bị hủy -> Hoàn trả kho
        if (newStatus == Order.OrderStatus.CANCELLED) {
            releaseReservedStock(order);
        }

        // Khi đơn hàng bị trả lại -> Hoàn trả kho + Hoàn tiền
        if (newStatus == Order.OrderStatus.RETURNED) {
            processReturnedOrder(order);
        }
    }

    /**
     * Giữ hàng trong kho khi đơn hàng được xác nhận
     */
    private void reserveStock(Order order) {
        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getOrderId());
        
        for (OrderDetail detail : details) {
            InventoryTransactionDTO transactionDTO = new InventoryTransactionDTO();
            transactionDTO.setVariantId(detail.getVariantId());
            transactionDTO.setTransactionType("OUT");
            transactionDTO.setQuantity(detail.getQuantity());
            transactionDTO.setReferenceType("ORDER");
            transactionDTO.setReferenceId(order.getOrderId());
            transactionDTO.setNotes("Giữ hàng cho đơn hàng " + order.getOrderNumber());
            
            try {
                inventoryTransactionService.createTransaction(transactionDTO);
                log.info("Đã giữ {} sản phẩm variant #{} cho đơn hàng #{}",
                    detail.getQuantity(), detail.getVariantId(), order.getOrderNumber());
            } catch (Exception e) {
                log.error("Lỗi khi giữ hàng cho đơn hàng #{}: {}", order.getOrderNumber(), e.getMessage());
                throw new RuntimeException("Không đủ hàng trong kho để xác nhận đơn hàng", e);
            }
        }
    }

    /**
     * Xử lý đơn hàng đã giao thành công
     */
    private void processDeliveredOrder(Order order) {
        // 1. Trừ kho nếu chưa trừ (trường hợp đơn hàng chuyển thẳng từ PENDING sang DELIVERED)
        // Kiểm tra xem đã có giao dịch OUT cho đơn hàng này chưa
        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getOrderId());
        boolean hasInventoryTransaction = false;
        
        try {
            // Kiểm tra xem đã có giao dịch kho cho đơn hàng này chưa
            List<InventoryTransactionDTO> existingTransactions =
                inventoryTransactionService.getTransactionsByReference("ORDER", order.getOrderId());
            hasInventoryTransaction = !existingTransactions.isEmpty();
        } catch (Exception e) {
            log.warn("Không thể kiểm tra giao dịch kho cho đơn hàng #{}", order.getOrderNumber());
        }
        
        // Nếu chưa có giao dịch trừ kho, thực hiện trừ kho
        if (!hasInventoryTransaction) {
            log.info("Đơn hàng #{} chưa trừ kho, thực hiện trừ kho ngay", order.getOrderNumber());
            for (OrderDetail detail : details) {
                InventoryTransactionDTO transactionDTO = new InventoryTransactionDTO();
                transactionDTO.setVariantId(detail.getVariantId());
                transactionDTO.setTransactionType("OUT");
                transactionDTO.setQuantity(detail.getQuantity());
                transactionDTO.setReferenceType("ORDER");
                transactionDTO.setReferenceId(order.getOrderId());
                transactionDTO.setNotes("Xuất kho cho đơn hàng " + order.getOrderNumber() + " (đã giao)");
                
                try {
                    inventoryTransactionService.createTransaction(transactionDTO);
                    log.info("Đã trừ {} sản phẩm variant #{} cho đơn hàng #{}",
                        detail.getQuantity(), detail.getVariantId(), order.getOrderNumber());
                } catch (Exception e) {
                    log.error("Lỗi khi trừ kho cho đơn hàng #{}: {}", order.getOrderNumber(), e.getMessage());
                    // Không throw exception để không làm gián đoạn quá trình giao hàng
                }
            }
        }
        
        // 2. Cập nhật thông tin khách hàng
        updateCustomerStatistics(order);

        // 3. Cập nhật trạng thái thanh toán nếu chưa thanh toán
        if (order.getPaymentStatus() != Order.PaymentStatus.PAID) {
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            orderRepository.save(order);
            log.info("Đã cập nhật trạng thái thanh toán cho đơn hàng #{}", order.getOrderNumber());
        }

        log.info("Đã xử lý hoàn tất đơn hàng #{}", order.getOrderNumber());
    }

    /**
     * Cập nhật thống kê khách hàng khi đơn hàng hoàn thành
     */
    private void updateCustomerStatistics(Order order) {
        if (order.getCustomerId() == null) {
            return;
        }

        Customer customer = customerRepository.findById(order.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));

        // Cập nhật tổng số đơn hàng
        Integer currentTotalOrders = customer.getTotalOrders() != null ? customer.getTotalOrders() : 0;
        customer.setTotalOrders(currentTotalOrders + 1);

        // Cập nhật tổng chi tiêu
        BigDecimal currentTotalSpent = customer.getTotalSpent() != null ? customer.getTotalSpent() : BigDecimal.ZERO;
        customer.setTotalSpent(currentTotalSpent.add(order.getTotalAmount()));

        // Cập nhật tier khách hàng dựa trên tổng chi tiêu
        updateCustomerTier(customer);

        customerRepository.save(customer);
        log.info("Đã cập nhật thống kê cho khách hàng #{}: Tổng đơn = {}, Tổng chi tiêu = {}",
            customer.getCustomerId(), customer.getTotalOrders(), customer.getTotalSpent());
    }

    /**
     * Cập nhật tier khách hàng dựa trên tổng chi tiêu
     */
    private void updateCustomerTier(Customer customer) {
        BigDecimal totalSpent = customer.getTotalSpent();
        
        if (totalSpent.compareTo(new BigDecimal("10000000")) >= 0) {
            customer.setCustomerTier(Customer.CustomerTier.VIP);
        } else if (totalSpent.compareTo(new BigDecimal("5000000")) >= 0) {
            customer.setCustomerTier(Customer.CustomerTier.REGULAR);
        } else if (customer.getTotalOrders() > 0) {
            customer.setCustomerTier(Customer.CustomerTier.REGULAR);
        }
    }

    /**
     * Hoàn trả hàng về kho khi đơn hàng bị hủy
     */
    private void releaseReservedStock(Order order) {
        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getOrderId());
        
        for (OrderDetail detail : details) {
            InventoryTransactionDTO transactionDTO = new InventoryTransactionDTO();
            transactionDTO.setVariantId(detail.getVariantId());
            transactionDTO.setTransactionType("IN");
            transactionDTO.setQuantity(detail.getQuantity());
            transactionDTO.setReferenceType("ORDER_CANCEL");
            transactionDTO.setReferenceId(order.getOrderId());
            transactionDTO.setNotes("Hoàn trả hàng do hủy đơn " + order.getOrderNumber());
            
            try {
                inventoryTransactionService.createTransaction(transactionDTO);
                log.info("Đã hoàn trả {} sản phẩm variant #{} từ đơn hàng #{}",
                    detail.getQuantity(), detail.getVariantId(), order.getOrderNumber());
            } catch (Exception e) {
                log.error("Lỗi khi hoàn trả hàng cho đơn hàng #{}: {}", order.getOrderNumber(), e.getMessage());
            }
        }
    }

    /**
     * Xử lý đơn hàng bị trả lại
     */
    private void processReturnedOrder(Order order) {
        // 1. Hoàn trả hàng về kho
        releaseReservedStock(order);

        // 2. Cập nhật trạng thái thanh toán thành hoàn tiền
        order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        orderRepository.save(order);

        // 3. Trừ lại thống kê khách hàng
        if (order.getCustomerId() != null) {
            Customer customer = customerRepository.findById(order.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));

            // Trừ tổng số đơn hàng
            Integer currentTotalOrders = customer.getTotalOrders() != null ? customer.getTotalOrders() : 0;
            if (currentTotalOrders > 0) {
                customer.setTotalOrders(currentTotalOrders - 1);
            }

            // Trừ tổng chi tiêu
            BigDecimal currentTotalSpent = customer.getTotalSpent() != null ? customer.getTotalSpent() : BigDecimal.ZERO;
            customer.setTotalSpent(currentTotalSpent.subtract(order.getTotalAmount()));

            // Cập nhật lại tier
            updateCustomerTier(customer);

            customerRepository.save(customer);
            log.info("Đã trừ lại thống kê cho khách hàng #{} do đơn hàng #{} bị trả lại",
                customer.getCustomerId(), order.getOrderNumber());
        }

        log.info("Đã xử lý hoàn tất đơn hàng trả lại #{}", order.getOrderNumber());
    }

    @Transactional
    public OrderDTO updateShippingAddress(Integer orderId, Integer newAddressId) {
        // 1. Get order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy đơn hàng với ID: " + orderId));

        // 2. Validate order status - Only allow update for PENDING and CONFIRMED orders
        if (order.getStatus() != Order.OrderStatus.PENDING
                && order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Chỉ có thể cập nhật địa chỉ cho đơn hàng đang chờ xác nhận hoặc đã xác nhận. " +
                            "Trạng thái hiện tại: " + order.getStatus());
        }

        // 3. Verify address exists and belongs to the same customer
        CustomerAddress address = customerAddressRepository.findById(newAddressId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy địa chỉ với ID: " + newAddressId));

        if (!address.getCustomer().getCustomerId().equals(order.getCustomerId())) {
            throw new IllegalArgumentException(
                    "Địa chỉ không thuộc về khách hàng của đơn hàng này");
        }

        // 4. Update address
        order.setShippingAddressId(newAddressId);
        Order updated = orderRepository.save(order);

        return convertToDTO(updated);
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setOrderId(order.getOrderId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerId(order.getCustomerId());

        // Lấy thông tin khách hàng
        if (order.getCustomerId() != null) {
            customerRepository.findById(order.getCustomerId()).ifPresent(customer -> {
                dto.setCustomerName(customer.getFullName());
                dto.setCustomer(convertCustomerToDTO(customer));
            });
        }

        dto.setShippingAddressId(order.getShippingAddressId());

        // Lấy thông tin địa chỉ giao hàng
        if (order.getShippingAddressId() != null) {
            customerAddressRepository.findById(order.getShippingAddressId())
                    .ifPresent(address -> dto.setShippingAddress(convertAddressToDTO(address)));
        }

        dto.setShippingCode(order.getShippingCode());
        dto.setShippingMethod(order.getShippingMethod());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus().name());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus().name());
        dto.setSubtotal(order.getSubtotal());
        dto.setShippingFee(order.getShippingFee());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setNotes(order.getNotes());
        dto.setCancellationReason(order.getCancellationReason());
        dto.setReturnReason(order.getReturnReason());
        dto.setCreatedBy(order.getCreatedBy());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        // Load order items
        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getOrderId());
        dto.setItems(details.stream()
                .map(this::convertDetailToDTO)
                .collect(Collectors.toList()));

        return dto;
    }

    private CustomerDTO convertCustomerToDTO(Customer customer) {
        CustomerDTO dto = new CustomerDTO();
        dto.setCustomerId(customer.getCustomerId());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setFullName(customer.getFullName());
        dto.setGender(customer.getGender() != null ? customer.getGender().name() : null);
        dto.setDateOfBirth(customer.getDateOfBirth());
        dto.setCustomerTier(customer.getCustomerTier() != null ? customer.getCustomerTier().name() : null);
        dto.setTotalOrders(customer.getTotalOrders());
        dto.setTotalSpent(customer.getTotalSpent());
        return dto;
    }

    private CustomerAddressDTO convertAddressToDTO(CustomerAddress address) {
        CustomerAddressDTO dto = new CustomerAddressDTO();
        dto.setAddressId(address.getAddressId());
        dto.setCustomerId(address.getCustomer().getCustomerId());
        dto.setRecipientName(address.getRecipientName());
        dto.setPhone(address.getPhone());
        dto.setAddressLine(address.getAddressLine());
        dto.setWard(address.getWard());
        dto.setDistrict(address.getDistrict());
        dto.setCity(address.getCity());
        dto.setIsDefault(address.getIsDefault());
        if (address.getCreatedAt() != null) {
            dto.setCreatedAt(address.getCreatedAt().toString());
        }
        return dto;
    }

    private Order convertToEntity(OrderDTO dto) {
        Order order = new Order();
        // orderNumber sẽ tự động generate trong @PrePersist
        order.setCustomerId(dto.getCustomerId());
        order.setShippingAddressId(dto.getShippingAddressId());
        order.setShippingMethod(dto.getShippingMethod());
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setSubtotal(dto.getSubtotal());
        order.setShippingFee(dto.getShippingFee());
        order.setDiscountAmount(dto.getDiscountAmount());
        order.setTotalAmount(dto.getTotalAmount());
        order.setNotes(dto.getNotes());
        order.setCreatedBy(dto.getCreatedBy());
        return order;
    }

    private OrderDetailDTO convertDetailToDTO(OrderDetail detail) {
        OrderDetailDTO dto = new OrderDetailDTO();
        dto.setOrderDetailId(detail.getOrderDetailId());
        dto.setOrderId(detail.getOrderId());
        dto.setVariantId(detail.getVariantId());
        dto.setQuantity(detail.getQuantity());
        dto.setUnitPrice(detail.getUnitPrice());
        dto.setDiscountAmount(detail.getDiscountAmount());

        // Calculate total price
        if (detail.getQuantity() != null && detail.getUnitPrice() != null) {
            java.math.BigDecimal total = detail.getUnitPrice()
                    .multiply(java.math.BigDecimal.valueOf(detail.getQuantity()));
            if (detail.getDiscountAmount() != null) {
                total = total.subtract(detail.getDiscountAmount());
            }
            dto.setTotalPrice(total);
        }

        // Load product information from variant
        if (detail.getVariantId() != null) {
            productVariantRepository.findById(detail.getVariantId()).ifPresent(variant -> {
                dto.setVariantSku(variant.getVariantSku());
                dto.setColor(variant.getColor());
                dto.setSize(variant.getSize());

                // Get product name from productId
                if (variant.getProductId() != null) {
                    productRepository.findById(variant.getProductId()).ifPresent(product -> {
                        dto.setProductName(product.getProductName());
                    });
                }
            });
        }

        return dto;
    }
}
