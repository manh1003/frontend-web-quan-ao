package ut.edu.demowebbanquanao.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.edu.demowebbanquanao.dto.CouponDTO;
import ut.edu.demowebbanquanao.entity.Coupon;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.CouponRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponService {
    private final CouponRepository couponRepository;

    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<CouponDTO> getActiveCoupons() {
        return couponRepository.findActiveCoupons(LocalDateTime.now()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CouponDTO getCouponById(Integer id) {
        return toDTO(couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon không tồn tại với ID: " + id)));
    }

    public CouponDTO getCouponByCode(String code) {
        return toDTO(couponRepository.findByCouponCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon không tồn tại với mã: " + code)));
    }

    public CouponDTO validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCouponCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));

        LocalDateTime now = LocalDateTime.now();

        if (!coupon.getIsActive()) {
            throw new IllegalArgumentException("Mã giảm giá đã bị vô hiệu hóa");
        }

        if (now.isBefore(coupon.getStartDate())) {
            throw new IllegalArgumentException("Mã giảm giá chưa có hiệu lực");
        }

        if (now.isAfter(coupon.getEndDate())) {
            throw new IllegalArgumentException("Mã giảm giá đã hết hạn");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new IllegalArgumentException("Mã giảm giá đã hết lượt sử dụng");
        }

        return toDTO(coupon);
    }

    @Transactional
    public CouponDTO createCoupon(CouponDTO dto) {
        Coupon coupon = toEntity(dto);
        return toDTO(couponRepository.save(coupon));
    }

    @Transactional
    public CouponDTO updateCoupon(Integer id, CouponDTO dto) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon không tồn tại với ID: " + id));

        coupon.setCouponCode(dto.getCouponCode());
        coupon.setCouponName(dto.getCouponName());
        coupon.setDescription(dto.getDescription());
        coupon.setDiscountType(Coupon.DiscountType.valueOf(dto.getDiscountType()));
        coupon.setDiscountValue(dto.getDiscountValue());
        coupon.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        coupon.setMinOrderAmount(dto.getMinOrderAmount());
        coupon.setUsageLimit(dto.getUsageLimit());
        coupon.setStartDate(dto.getStartDate());
        coupon.setEndDate(dto.getEndDate());
        coupon.setIsActive(dto.getIsActive());

        return toDTO(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Integer id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon không tồn tại với ID: " + id);
        }
        couponRepository.deleteById(id);
    }

    private CouponDTO toDTO(Coupon entity) {
        return new CouponDTO(
            entity.getCouponId(),
            entity.getCouponCode(),
            entity.getCouponName(),
            entity.getDescription(),
            entity.getDiscountType().name(),
            entity.getDiscountValue(),
            entity.getMaxDiscountAmount(),
            entity.getMinOrderAmount(),
            entity.getUsageLimit(),
            entity.getUsedCount(),
            entity.getStartDate(),
            entity.getEndDate(),
            entity.getIsActive()
        );
    }

    private Coupon toEntity(CouponDTO dto) {
        Coupon coupon = new Coupon();
        coupon.setCouponCode(dto.getCouponCode());
        coupon.setCouponName(dto.getCouponName());
        coupon.setDescription(dto.getDescription());
        coupon.setDiscountType(Coupon.DiscountType.valueOf(dto.getDiscountType()));
        coupon.setDiscountValue(dto.getDiscountValue());
        coupon.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        coupon.setMinOrderAmount(dto.getMinOrderAmount());
        coupon.setUsageLimit(dto.getUsageLimit());
        coupon.setUsedCount(dto.getUsedCount() != null ? dto.getUsedCount() : 0);
        coupon.setStartDate(dto.getStartDate());
        coupon.setEndDate(dto.getEndDate());
        coupon.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return coupon;
    }
}
