package ut.edu.demowebbanquanao.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ut.edu.demowebbanquanao.entity.CustomerAddress;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Integer> {
    
    /**
     * Tìm tất cả địa chỉ của một khách hàng
     */
    List<CustomerAddress> findByCustomer_CustomerId(Integer customerId);
    
    /**
     * Tìm địa chỉ mặc định của khách hàng
     */
    Optional<CustomerAddress> findByCustomer_CustomerIdAndIsDefaultTrue(Integer customerId);
    
    /**
     * Kiểm tra xem khách hàng có địa chỉ nào không
     */
    boolean existsByCustomer_CustomerId(Integer customerId);
    
    /**
     * Đếm số lượng địa chỉ của khách hàng
     */
    long countByCustomer_CustomerId(Integer customerId);
}