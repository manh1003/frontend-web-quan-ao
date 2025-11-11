package ut.edu.demowebbanquanao.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ut.edu.demowebbanquanao.entity.HeroBanner;

@Repository
public interface HeroBannerRepository extends JpaRepository<HeroBanner, Long> {

    // Find all active banners ordered by display order
    List<HeroBanner> findByIsActiveTrueOrderByDisplayOrderAsc();

    // Find active banners within date range
    List<HeroBanner> findByIsActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByDisplayOrderAsc(
            LocalDateTime startDate, LocalDateTime endDate);

    // Find all ordered by display order
    List<HeroBanner> findAllByOrderByDisplayOrderAsc();
}






