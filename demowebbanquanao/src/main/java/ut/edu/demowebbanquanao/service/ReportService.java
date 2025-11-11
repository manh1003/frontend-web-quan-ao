package ut.edu.demowebbanquanao.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import ut.edu.demowebbanquanao.dto.ReportDTO;
import ut.edu.demowebbanquanao.entity.Order;
import ut.edu.demowebbanquanao.repository.CustomerRepository;
import ut.edu.demowebbanquanao.repository.OrderRepository;
import ut.edu.demowebbanquanao.repository.ProductRepository;
import ut.edu.demowebbanquanao.repository.ProductVariantRepository;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    public ReportDTO getDashboardReport() {
        ReportDTO report = new ReportDTO();

        // Tính doanh thu từ tất cả đơn hàng hợp lệ (loại trừ đơn hủy và trả hàng)
        // Chỉ tính doanh thu từ các đơn hàng đã giao thành công
        List<Order> validOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
                .collect(Collectors.toList());

        BigDecimal totalRevenue = validOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        report.setTotalRevenue(totalRevenue);
        report.setTotalOrders((long) validOrders.size());
        report.setTotalCustomers(customerRepository.count());
        report.setTotalProducts(productRepository.count());

        return report;
    }

    public ReportDTO getSalesReport(ZonedDateTime startDate, ZonedDateTime endDate) {
        ReportDTO report = new ReportDTO();
        Map<String, Object> additionalData = new HashMap<>();

        // Chuyển đổi ZonedDateTime về timezone hệ thống (Asia/Saigon) để so sánh chính xác
        LocalDateTime startLocal = startDate.withZoneSameInstant(java.time.ZoneId.systemDefault()).toLocalDateTime();
        LocalDateTime endLocal = endDate.withZoneSameInstant(java.time.ZoneId.systemDefault()).toLocalDateTime();

        // Lấy tất cả đơn hàng và lọc trong khoảng thời gian
        List<Order> allOrders = orderRepository.findAll();
        List<Order> ordersInRange = allOrders.stream()
                .filter(o -> {
                    LocalDateTime orderDate = o.getOrderDate();
                    return orderDate != null &&
                           !orderDate.isBefore(startLocal) &&
                           !orderDate.isAfter(endLocal);
                })
                .collect(Collectors.toList());

        // Lọc các đơn hàng hợp lệ (loại trừ đơn hủy và trả hàng)
        List<Order> validOrders = ordersInRange.stream()
                .filter(o -> o.getStatus() != Order.OrderStatus.CANCELLED
                          && o.getStatus() != Order.OrderStatus.RETURNED)
                .collect(Collectors.toList());

        // Lọc các đơn đã giao để tính doanh thu
        List<Order> deliveredOrders = validOrders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
                .collect(Collectors.toList());

        // Tính tổng doanh thu từ đơn đã giao
        BigDecimal totalRevenue = deliveredOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Set dữ liệu cơ bản
        report.setTotalRevenue(totalRevenue);
        report.setTotalOrders((long) validOrders.size());

        // Tính toán doanh thu theo ngày (chỉ từ đơn đã giao)
        Map<String, BigDecimal> dailyRevenue = deliveredOrders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getOrderDate().toLocalDate().toString(),
                        Collectors.mapping(Order::getTotalAmount,
                                         Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        List<Map<String, Object>> dailySales = dailyRevenue.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> dayData = new HashMap<>();
                    dayData.put("date", entry.getKey());
                    dayData.put("revenue", entry.getValue());
                    return dayData;
                })
                .sorted((a, b) -> a.get("date").toString().compareTo(b.get("date").toString()))
                .collect(Collectors.toList());

        report.setDailySales(dailySales);

        // Thêm thông tin chi tiết
        long pendingCount = validOrders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.PENDING ||
                           o.getStatus() == Order.OrderStatus.CONFIRMED ||
                           o.getStatus() == Order.OrderStatus.PROCESSING ||
                           o.getStatus() == Order.OrderStatus.SHIPPING)
                .count();
        
        additionalData.put("startDate", startDate);
        additionalData.put("endDate", endDate);
        additionalData.put("totalOrders", validOrders.size());
        additionalData.put("deliveredOrders", deliveredOrders.size());
        additionalData.put("pendingOrders", pendingCount);
        additionalData.put("averageOrderValue",
            deliveredOrders.isEmpty() ? BigDecimal.ZERO :
            totalRevenue.divide(BigDecimal.valueOf(deliveredOrders.size()), 2, java.math.RoundingMode.HALF_UP));

        report.setAdditionalData(additionalData);

        return report;
    }

    public Map<String, Object> getInventoryReport() {
        Map<String, Object> report = new HashMap<>();

        long totalVariants = variantRepository.count();
        List<ut.edu.demowebbanquanao.entity.ProductVariant> lowStockItems =
            variantRepository.findByStockQuantityLessThanMinStockThreshold();

        report.put("totalVariants", totalVariants);
        report.put("lowStockCount", lowStockItems.size());
        report.put("lowStockItems", lowStockItems.stream()
            .map(v -> Map.of(
                "variantId", v.getVariantId(),
                "sku", v.getVariantSku(),
                "currentStock", v.getStockQuantity(),
                "minThreshold", v.getMinStockThreshold()
            ))
            .collect(Collectors.toList()));

        return report;
    }

    public Map<String, Long> getOrderStatusReport() {
        List<Order> orders = orderRepository.findAll();

        return orders.stream()
                .collect(Collectors.groupingBy(
                    order -> order.getStatus().name(),
                    Collectors.counting()
                ));
    }
}
