package ut.edu.demowebbanquanao.service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ut.edu.demowebbanquanao.dto.CustomerAddressDTO;
import ut.edu.demowebbanquanao.entity.Customer;
import ut.edu.demowebbanquanao.entity.CustomerAddress;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.CustomerAddressRepository;
import ut.edu.demowebbanquanao.repository.CustomerRepository;

@Service
public class CustomerAddressService {

    @Autowired
    private CustomerAddressRepository addressRepository;

    @Autowired
    private CustomerRepository customerRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Lấy tất cả địa chỉ của khách hàng
     */
    public List<CustomerAddressDTO> getAddressesByCustomerId(Integer customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + customerId);
        }
        
        return addressRepository.findByCustomer_CustomerId(customerId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy địa chỉ theo ID
     */
    public CustomerAddressDTO getAddressById(Integer addressId) {
        CustomerAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ với ID: " + addressId));
        return convertToDTO(address);
    }

    /**
     * Lấy địa chỉ mặc định của khách hàng
     */
    public CustomerAddressDTO getDefaultAddress(Integer customerId) {
        CustomerAddress address = addressRepository.findByCustomer_CustomerIdAndIsDefaultTrue(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng chưa có địa chỉ mặc định"));
        return convertToDTO(address);
    }

    /**
     * Tạo địa chỉ mới
     */
    @Transactional
    public CustomerAddressDTO createAddress(CustomerAddressDTO dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + dto.getCustomerId()));

        // Nếu đây là địa chỉ mặc định, bỏ default của các địa chỉ khác
        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            unsetDefaultAddress(dto.getCustomerId());
        }

        CustomerAddress address = new CustomerAddress();
        address.setCustomer(customer);
        address.setRecipientName(dto.getRecipientName());
        address.setPhone(dto.getPhone());
        address.setAddressLine(dto.getAddressLine());
        address.setWard(dto.getWard());
        address.setDistrict(dto.getDistrict());
        address.setCity(dto.getCity());
        address.setIsDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false);

        CustomerAddress saved = addressRepository.save(address);
        return convertToDTO(saved);
    }

    /**
     * Cập nhật địa chỉ
     */
    @Transactional
    public CustomerAddressDTO updateAddress(Integer addressId, CustomerAddressDTO dto) {
        CustomerAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ với ID: " + addressId));

        // Nếu đổi thành địa chỉ mặc định, bỏ default của các địa chỉ khác
        if (Boolean.TRUE.equals(dto.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            unsetDefaultAddress(address.getCustomer().getCustomerId());
        }

        address.setRecipientName(dto.getRecipientName());
        address.setPhone(dto.getPhone());
        address.setAddressLine(dto.getAddressLine());
        address.setWard(dto.getWard());
        address.setDistrict(dto.getDistrict());
        address.setCity(dto.getCity());
        address.setIsDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false);

        CustomerAddress updated = addressRepository.save(address);
        return convertToDTO(updated);
    }

    /**
     * Đặt địa chỉ làm mặc định
     */
    @Transactional
    public void setDefaultAddress(Integer addressId) {
        CustomerAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ với ID: " + addressId));

        // Bỏ default của các địa chỉ khác
        unsetDefaultAddress(address.getCustomer().getCustomerId());

        address.setIsDefault(true);
        addressRepository.save(address);
    }

    /**
     * Xóa địa chỉ
     */
    @Transactional
    public void deleteAddress(Integer addressId) {
        CustomerAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ với ID: " + addressId));

        // Nếu xóa địa chỉ mặc định, tự động đặt địa chỉ đầu tiên còn lại làm mặc định
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            Integer customerId = address.getCustomer().getCustomerId();
            addressRepository.delete(address);
            
            List<CustomerAddress> remainingAddresses = addressRepository.findByCustomer_CustomerId(customerId);
            if (!remainingAddresses.isEmpty()) {
                CustomerAddress firstAddress = remainingAddresses.get(0);
                firstAddress.setIsDefault(true);
                addressRepository.save(firstAddress);
            }
        } else {
            addressRepository.delete(address);
        }
    }

    /**
     * Bỏ trạng thái mặc định của tất cả địa chỉ của khách hàng
     */
    private void unsetDefaultAddress(Integer customerId) {
        List<CustomerAddress> addresses = addressRepository.findByCustomer_CustomerId(customerId);
        addresses.forEach(addr -> {
            if (Boolean.TRUE.equals(addr.getIsDefault())) {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            }
        });
    }

    /**
     * Convert Entity sang DTO
     */
    private CustomerAddressDTO convertToDTO(CustomerAddress address) {
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
        dto.setCreatedAt(address.getCreatedAt() != null ? address.getCreatedAt().format(DATE_FORMATTER) : null);
        return dto;
    }
}