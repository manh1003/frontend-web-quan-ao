package ut.edu.demowebbanquanao.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import ut.edu.demowebbanquanao.dto.InventoryTransactionDTO;
import ut.edu.demowebbanquanao.exception.ApiResponse;
import ut.edu.demowebbanquanao.service.InventoryTransactionService;

@RestController
@RequestMapping("/api/inventory-transactions")
public class InventoryTransactionController {

    @Autowired
    private InventoryTransactionService inventoryTransactionService;

    // Tạo transaction mới
    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_INVENTORY')")
    public ResponseEntity<?> createTransaction(@Valid @RequestBody InventoryTransactionDTO dto) {
        try {
            InventoryTransactionDTO created = inventoryTransactionService.createTransaction(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Tạo transaction thành công", created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy tất cả transaction
    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_INVENTORY')")
    public ResponseEntity<?> getAllTransactions() {
        try {
            List<InventoryTransactionDTO> transactions = inventoryTransactionService.getAllTransactions();
            return ResponseEntity.ok(new ApiResponse(true, "Lấy danh sách transaction thành công", transactions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy transaction theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_INVENTORY')")
    public ResponseEntity<?> getTransactionById(@PathVariable Integer id) {
        try {
            InventoryTransactionDTO transaction = inventoryTransactionService.getTransactionById(id);
            return ResponseEntity.ok(new ApiResponse(true, "Lấy transaction thành công", transaction));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy transaction theo variant
    @GetMapping("/by-variant/{variantId}")
    @PreAuthorize("hasAuthority('VIEW_INVENTORY')")
    public ResponseEntity<?> getTransactionsByVariant(@PathVariable Integer variantId) {
        try {
            List<InventoryTransactionDTO> transactions = inventoryTransactionService
                    .getTransactionsByVariant(variantId);
            return ResponseEntity.ok(new ApiResponse(true, "Lấy transaction của variant thành công", transactions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy transaction theo loại
    @GetMapping("/by-type/{type}")
    @PreAuthorize("hasAuthority('VIEW_INVENTORY')")
    public ResponseEntity<?> getTransactionsByType(@PathVariable String type) {
        try {
            List<InventoryTransactionDTO> transactions = inventoryTransactionService.getTransactionsByType(type);
            return ResponseEntity.ok(new ApiResponse(true, "Lấy transaction theo loại thành công", transactions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy transaction trong khoảng thời gian
    @GetMapping("/by-date-range")
    @PreAuthorize("hasAuthority('VIEW_INVENTORY')")
    public ResponseEntity<?> getTransactionsByDateRange(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        try {
            List<InventoryTransactionDTO> transactions = inventoryTransactionService
                    .getTransactionsByDateRange(startDate, endDate);
            return ResponseEntity
                    .ok(new ApiResponse(true, "Lấy transaction theo khoảng thời gian thành công", transactions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy transaction theo reference
    @GetMapping("/by-reference")
    @PreAuthorize("hasAuthority('VIEW_INVENTORY')")
    public ResponseEntity<?> getTransactionsByReference(
            @RequestParam String referenceType,
            @RequestParam Integer referenceId) {
        try {
            List<InventoryTransactionDTO> transactions = inventoryTransactionService
                    .getTransactionsByReference(referenceType, referenceId);
            return ResponseEntity.ok(new ApiResponse(true, "Lấy transaction theo reference thành công", transactions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy transaction theo user tạo
    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasAuthority('VIEW_INVENTORY')")
    public ResponseEntity<?> getTransactionsByCreatedBy(@PathVariable Integer userId) {
        try {
            List<InventoryTransactionDTO> transactions = inventoryTransactionService.getTransactionsByCreatedBy(userId);
            return ResponseEntity.ok(new ApiResponse(true, "Lấy transaction theo user thành công", transactions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Tính tổng số lượng IN
    @GetMapping("/stats/total-in/{variantId}")
    @PreAuthorize("hasAuthority('VIEW_INVENTORY')")
    public ResponseEntity<?> calculateTotalInQuantity(@PathVariable Integer variantId) {
        try {
            Integer totalIn = inventoryTransactionService.calculateTotalInQuantity(variantId);
            Map<String, Object> response = new HashMap<>();
            response.put("variantId", variantId);
            response.put("totalInQuantity", totalIn);
            return ResponseEntity.ok(new ApiResponse(true, "Tính tổng số lượng IN thành công", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Tính tổng số lượng OUT
    @GetMapping("/stats/total-out/{variantId}")
    @PreAuthorize("hasAuthority('VIEW_INVENTORY')")
    public ResponseEntity<?> calculateTotalOutQuantity(@PathVariable Integer variantId) {
        try {
            Integer totalOut = inventoryTransactionService.calculateTotalOutQuantity(variantId);
            Map<String, Object> response = new HashMap<>();
            response.put("variantId", variantId);
            response.put("totalOutQuantity", totalOut);
            return ResponseEntity.ok(new ApiResponse(true, "Tính tổng số lượng OUT thành công", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Tính số lượng tồn kho hiện tại
    @GetMapping("/stats/current-stock/{variantId}")
    @PreAuthorize("hasAuthority('VIEW_INVENTORY')")
    public ResponseEntity<?> calculateCurrentStock(@PathVariable Integer variantId) {
        try {
            Integer currentStock = inventoryTransactionService.calculateCurrentStock(variantId);
            Map<String, Object> response = new HashMap<>();
            response.put("variantId", variantId);
            response.put("currentStock", currentStock);
            return ResponseEntity.ok(new ApiResponse(true, "Tính số lượng tồn kho thành công", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Lấy transaction mới nhất
    @GetMapping("/latest/{variantId}")
    @PreAuthorize("hasAuthority('VIEW_INVENTORY')")
    public ResponseEntity<?> getLatestTransaction(@PathVariable Integer variantId) {
        try {
            InventoryTransactionDTO transaction = inventoryTransactionService.getLatestTransaction(variantId);
            if (transaction != null) {
                return ResponseEntity.ok(new ApiResponse(true, "Lấy transaction mới nhất thành công", transaction));
            } else {
                return ResponseEntity.ok(new ApiResponse(true, "Không có transaction nào", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Xóa transaction
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_INVENTORY')")
    public ResponseEntity<?> deleteTransaction(@PathVariable Integer id) {
        try {
            inventoryTransactionService.deleteTransaction(id);
            return ResponseEntity.ok(new ApiResponse(true, "Xóa transaction thành công", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }
}