package ut.edu.demowebbanquanao.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import ut.edu.demowebbanquanao.dto.CustomerDTO;
import ut.edu.demowebbanquanao.entity.Customer;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.CustomerRepository;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CustomerDTO getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + id));
        return convertToDTO(customer);
    }

    public CustomerDTO getCustomerByEmail(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với email: " + email));
        return convertToDTO(customer);
    }

    @Transactional
    public CustomerDTO createCustomer(CustomerDTO dto) {
        Customer customer = convertToEntity(dto);
        Customer saved = customerRepository.save(customer);
        return convertToDTO(saved);
    }

    @Transactional
    public CustomerDTO updateCustomer(Integer id, CustomerDTO dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + id));

        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setFullName(dto.getFullName());
        customer.setDateOfBirth(dto.getDateOfBirth());

        Customer updated = customerRepository.save(customer);
        return convertToDTO(updated);
    }

    private CustomerDTO convertToDTO(Customer customer) {
        CustomerDTO dto = new CustomerDTO();
        dto.setCustomerId(customer.getCustomerId());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setFullName(customer.getFullName());
        dto.setGender(customer.getGender() != null ? customer.getGender().name() : null);
        dto.setDateOfBirth(customer.getDateOfBirth());
        dto.setCustomerTier(customer.getCustomerTier() != null ? customer.getCustomerTier().name() : "NEW");
        dto.setTotalOrders(customer.getTotalOrders() != null ? customer.getTotalOrders() : 0);
        dto.setTotalSpent(customer.getTotalSpent() != null ? customer.getTotalSpent() : java.math.BigDecimal.ZERO);
        dto.setRegistrationDate(customer.getCreatedAt()); // Use createdAt as registration date
        dto.setCreatedAt(customer.getCreatedAt());
        return dto;
    }

    private Customer convertToEntity(CustomerDTO dto) {
        Customer customer = new Customer();
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setFullName(dto.getFullName());

        // Set gender if provided
        if (dto.getGender() != null && !dto.getGender().isEmpty()) {
            try {
                customer.setGender(Customer.Gender.valueOf(dto.getGender().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Invalid gender, leave as null
            }
        }

        customer.setDateOfBirth(dto.getDateOfBirth());

        // Set default values
        if (customer.getCustomerTier() == null) {
            customer.setCustomerTier(Customer.CustomerTier.NEW);
        }
        if (customer.getTotalOrders() == null) {
            customer.setTotalOrders(0);
        }
        if (customer.getTotalSpent() == null) {
            customer.setTotalSpent(java.math.BigDecimal.ZERO);
        }

        return customer;
    }
}
