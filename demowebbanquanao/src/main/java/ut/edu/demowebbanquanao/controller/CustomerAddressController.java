package ut.edu.demowebbanquanao.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import ut.edu.demowebbanquanao.dto.CustomerAddressDTO;
import ut.edu.demowebbanquanao.exception.ApiResponse;
import ut.edu.demowebbanquanao.service.CustomerAddressService;

@RestController
@RequestMapping("/api/customer-addresses")
public class CustomerAddressController {

    @Autowired
    private CustomerAddressService addressService;

    /**
     * GET /api/customer-addresses/customer/{customerId}
     * Lấy tất cả địa chỉ của khách hàng
     * Note: Customer có thể xem địa chỉ của chính họ, Admin/Staff có thể xem tất cả
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<CustomerAddressDTO>>> getCustomerAddresses(
            @PathVariable Integer customerId) {
        List<CustomerAddressDTO> addresses = addressService.getAddressesByCustomerId(customerId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách địa chỉ thành công", addresses));
    }

    /**
     * GET /api/customer-addresses/{id}
     * Lấy địa chỉ theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerAddressDTO>> getAddressById(@PathVariable Integer id) {
        CustomerAddressDTO address = addressService.getAddressById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin địa chỉ thành công", address));
    }

    /**
     * GET /api/customer-addresses/customer/{customerId}/default
     * Lấy địa chỉ mặc định của khách hàng
     */
    @GetMapping("/customer/{customerId}/default")
    public ResponseEntity<ApiResponse<CustomerAddressDTO>> getDefaultAddress(@PathVariable Integer customerId) {
        CustomerAddressDTO address = addressService.getDefaultAddress(customerId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy địa chỉ mặc định thành công", address));
    }

    /**
     * POST /api/customer-addresses
     * Tạo địa chỉ mới
     * Customer có thể tạo địa chỉ cho chính họ
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CustomerAddressDTO>> createAddress(@Valid @RequestBody CustomerAddressDTO dto) {
        CustomerAddressDTO created = addressService.createAddress(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo địa chỉ thành công", created));
    }

    /**
     * PUT /api/customer-addresses/{id}
     * Cập nhật địa chỉ
     * Customer có thể cập nhật địa chỉ của chính họ
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerAddressDTO>> updateAddress(
            @PathVariable Integer id,
            @Valid @RequestBody CustomerAddressDTO dto) {
        CustomerAddressDTO updated = addressService.updateAddress(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật địa chỉ thành công", updated));
    }

    /**
     * PUT /api/customer-addresses/{id}/set-default
     * Đặt địa chỉ làm mặc định
     * Customer có thể set địa chỉ mặc định của chính họ
     */
    @PutMapping("/{id}/set-default")
    public ResponseEntity<ApiResponse<Void>> setDefaultAddress(@PathVariable Integer id) {
        addressService.setDefaultAddress(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đặt địa chỉ mặc định thành công", null));
    }

    /**
     * DELETE /api/customer-addresses/{id}
     * Xóa địa chỉ
     * Customer có thể xóa địa chỉ của chính họ
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Integer id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa địa chỉ thành công", null));
    }
}