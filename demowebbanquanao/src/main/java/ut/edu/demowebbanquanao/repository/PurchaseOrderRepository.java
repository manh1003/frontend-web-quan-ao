package ut.edu.demowebbanquanao.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ut.edu.demowebbanquanao.entity.PurchaseOrder;
import ut.edu.demowebbanquanao.entity.PurchaseOrder.POStatus;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer> {
    
    /**
     * Tìm đơn nhập hàng theo số PO
     */
    Optional<PurchaseOrder> findByPoNumber(String poNumber);
    
    /**
     * Tìm đơn nhập hàng theo nhà cung cấp
     */
    List<PurchaseOrder> findBySupplier_SupplierId(Integer supplierId);
    
    /**
     * Tìm đơn nhập hàng theo trạng thái
     */
    List<PurchaseOrder> findByStatus(POStatus status);
    
    /**
     * Tìm đơn nhập hàng theo khoảng thời gian đặt hàng
     */
    List<PurchaseOrder> findByOrderDateBetween(LocalDate startDate, LocalDate endDate);
    
    /**
     * Tìm đơn nhập hàng theo nhà cung cấp và trạng thái
     */
    List<PurchaseOrder> findBySupplier_SupplierIdAndStatus(Integer supplierId, POStatus status);
    
    /**
     * Kiểm tra sự tồn tại của số PO
     */
    boolean existsByPoNumber(String poNumber);
}