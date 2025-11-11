package ut.edu.demowebbanquanao.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import ut.edu.demowebbanquanao.dto.PurchaseOrderDTO;
import ut.edu.demowebbanquanao.exception.ApiResponse;
import ut.edu.demowebbanquanao.service.PurchaseOrderService;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService poService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * GET /api/purchase-orders
     * Lấy tất cả đơn nhập hàng
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('VIEW_INVENTORY', 'MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<List<PurchaseOrderDTO>>> getAllPurchaseOrders() {
        List<PurchaseOrderDTO> orders = poService.getAllPurchaseOrders();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đơn nhập hàng thành công", orders));
    }

    /**
     * GET /api/purchase-orders/{id}
     * Lấy đơn nhập hàng theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('VIEW_INVENTORY', 'MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> getPurchaseOrderById(@PathVariable Integer id) {
        PurchaseOrderDTO order = poService.getPurchaseOrderById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin đơn nhập hàng thành công", order));
    }

    /**
     * GET /api/purchase-orders/number/{poNumber}
     * Lấy đơn nhập hàng theo số PO
     */
    @GetMapping("/number/{poNumber}")
    @PreAuthorize("hasAnyAuthority('VIEW_INVENTORY', 'MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> getPurchaseOrderByNumber(@PathVariable String poNumber) {
        PurchaseOrderDTO order = poService.getPurchaseOrderByNumber(poNumber);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin đơn nhập hàng thành công", order));
    }

    /**
     * GET /api/purchase-orders/supplier/{supplierId}
     * Lấy đơn nhập hàng theo nhà cung cấp
     */
    @GetMapping("/supplier/{supplierId}")
    @PreAuthorize("hasAnyAuthority('VIEW_INVENTORY', 'MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<List<PurchaseOrderDTO>>> getPurchaseOrdersBySupplier(@PathVariable Integer supplierId) {
        List<PurchaseOrderDTO> orders = poService.getPurchaseOrdersBySupplier(supplierId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đơn nhập hàng theo nhà cung cấp thành công", orders));
    }

    /**
     * GET /api/purchase-orders/status/{status}
     * Lấy đơn nhập hàng theo trạng thái
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyAuthority('VIEW_INVENTORY', 'MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<List<PurchaseOrderDTO>>> getPurchaseOrdersByStatus(@PathVariable String status) {
        List<PurchaseOrderDTO> orders = poService.getPurchaseOrdersByStatus(status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đơn nhập hàng theo trạng thái thành công", orders));
    }

    /**
     * POST /api/purchase-orders
     * Tạo đơn nhập hàng mới
     */
    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderDTO dto,
            Authentication authentication) {
        Integer userId = Integer.parseInt(authentication.getName());
        PurchaseOrderDTO created = poService.createPurchaseOrder(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo đơn nhập hàng thành công", created));
    }

    /**
     * PUT /api/purchase-orders/{id}
     * Cập nhật đơn nhập hàng
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> updatePurchaseOrder(
            @PathVariable Integer id,
            @Valid @RequestBody PurchaseOrderDTO dto) {
        PurchaseOrderDTO updated = poService.updatePurchaseOrder(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật đơn nhập hàng thành công", updated));
    }

    /**
     * PUT /api/purchase-orders/{id}/approve
     * Phê duyệt đơn nhập hàng
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<Void>> approvePurchaseOrder(@PathVariable Integer id) {
        poService.approvePurchaseOrder(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Phê duyệt đơn nhập hàng thành công", null));
    }

    /**
     * PUT /api/purchase-orders/{id}/receive
     * Nhận hàng
     */
    @PutMapping("/{id}/receive")
    @PreAuthorize("hasAuthority('MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<Void>> receivePurchaseOrder(
            @PathVariable Integer id,
            @RequestParam String receivedDate) {
        LocalDate date = LocalDate.parse(receivedDate, DATE_FORMATTER);
        poService.receivePurchaseOrder(id, date);
        return ResponseEntity.ok(new ApiResponse<>(true, "Nhận hàng thành công", null));
    }

    /**
     * PUT /api/purchase-orders/{id}/cancel
     * Hủy đơn nhập hàng
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<Void>> cancelPurchaseOrder(@PathVariable Integer id) {
        poService.cancelPurchaseOrder(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Hủy đơn nhập hàng thành công", null));
    }
}