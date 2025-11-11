package ut.edu.demowebbanquanao.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.edu.demowebbanquanao.dto.HeroBannerDTO;
import ut.edu.demowebbanquanao.entity.HeroBanner;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.HeroBannerRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HeroBannerService {

    @Autowired
    private HeroBannerRepository heroBannerRepository;

    // Convert Entity to DTO
    private HeroBannerDTO convertToDTO(HeroBanner banner) {
        return new HeroBannerDTO(
                banner.getBannerId(),
                banner.getTitle(),
                banner.getSubtitle(),
                banner.getImageUrl(),
                banner.getLinkUrl(),
                banner.getButtonText(),
                banner.getDisplayOrder(),
                banner.getIsActive(),
                banner.getStartDate(),
                banner.getEndDate(),
                banner.getBackgroundColor(),
                banner.getTextColor(),
                banner.getCreatedAt(),
                banner.getUpdatedAt());
    }

    // Convert DTO to Entity
    private HeroBanner convertToEntity(HeroBannerDTO dto) {
        HeroBanner banner = new HeroBanner();
        banner.setBannerId(dto.getBannerId());
        banner.setTitle(dto.getTitle());
        banner.setSubtitle(dto.getSubtitle());
        banner.setImageUrl(dto.getImageUrl());
        banner.setLinkUrl(dto.getLinkUrl());
        banner.setButtonText(dto.getButtonText());
        banner.setDisplayOrder(dto.getDisplayOrder());
        banner.setIsActive(dto.getIsActive());
        banner.setStartDate(dto.getStartDate());
        banner.setEndDate(dto.getEndDate());
        banner.setBackgroundColor(dto.getBackgroundColor());
        banner.setTextColor(dto.getTextColor());
        return banner;
    }

    // Get all banners
    public List<HeroBannerDTO> getAllBanners() {
        return heroBannerRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get active banners only
    public List<HeroBannerDTO> getActiveBanners() {
        return heroBannerRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get active banners within current date range
    public List<HeroBannerDTO> getCurrentActiveBanners() {
        LocalDateTime now = LocalDateTime.now();
        return heroBannerRepository
                .findByIsActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByDisplayOrderAsc(now, now)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get banner by ID
    public HeroBannerDTO getBannerById(Long id) {
        HeroBanner banner = heroBannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found with id: " + id));
        return convertToDTO(banner);
    }

    // Create new banner
    @Transactional
    public HeroBannerDTO createBanner(HeroBannerDTO bannerDTO) {
        HeroBanner banner = convertToEntity(bannerDTO);
        HeroBanner savedBanner = heroBannerRepository.save(banner);
        return convertToDTO(savedBanner);
    }

    // Update banner
    @Transactional
    public HeroBannerDTO updateBanner(Long id, HeroBannerDTO bannerDTO) {
        HeroBanner existingBanner = heroBannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found with id: " + id));

        existingBanner.setTitle(bannerDTO.getTitle());
        existingBanner.setSubtitle(bannerDTO.getSubtitle());
        existingBanner.setImageUrl(bannerDTO.getImageUrl());
        existingBanner.setLinkUrl(bannerDTO.getLinkUrl());
        existingBanner.setButtonText(bannerDTO.getButtonText());
        existingBanner.setDisplayOrder(bannerDTO.getDisplayOrder());
        existingBanner.setIsActive(bannerDTO.getIsActive());
        existingBanner.setStartDate(bannerDTO.getStartDate());
        existingBanner.setEndDate(bannerDTO.getEndDate());
        existingBanner.setBackgroundColor(bannerDTO.getBackgroundColor());
        existingBanner.setTextColor(bannerDTO.getTextColor());

        HeroBanner updatedBanner = heroBannerRepository.save(existingBanner);
        return convertToDTO(updatedBanner);
    }

    // Delete banner
    @Transactional
    public void deleteBanner(Long id) {
        HeroBanner banner = heroBannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found with id: " + id));
        heroBannerRepository.delete(banner);
    }

    // Toggle banner active status
    @Transactional
    public HeroBannerDTO toggleBannerStatus(Long id) {
        HeroBanner banner = heroBannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found with id: " + id));
        banner.setIsActive(!banner.getIsActive());
        HeroBanner updatedBanner = heroBannerRepository.save(banner);
        return convertToDTO(updatedBanner);
    }
}






