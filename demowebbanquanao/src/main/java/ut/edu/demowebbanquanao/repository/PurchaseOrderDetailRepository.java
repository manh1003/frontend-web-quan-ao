package ut.edu.demowebbanquanao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ut.edu.demowebbanquanao.entity.PurchaseOrderDetail;

@Repository
public interface PurchaseOrderDetailRepository extends JpaRepository<PurchaseOrderDetail, Integer> {
    
    /**
     * Tìm chi tiết đơn nhập hàng theo mã đơn
     */
    List<PurchaseOrderDetail> findByPurchaseOrder_PoId(Integer poId);
    
    /**
     * Tìm chi tiết đơn nhập hàng theo biến thể sản phẩm
     */
    List<PurchaseOrderDetail> findByVariant_VariantId(Integer variantId);
    
    /**
     * Đếm số chi tiết của đơn nhập hàng
     */
    long countByPurchaseOrder_PoId(Integer poId);
    
    /**
     * Xóa chi tiết đơn nhập hàng theo mã đơn
     */
    void deleteByPurchaseOrder_PoId(Integer poId);
}