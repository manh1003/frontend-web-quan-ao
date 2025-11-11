package ut.edu.demowebbanquanao.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.edu.demowebbanquanao.dto.BrandDTO;
import ut.edu.demowebbanquanao.entity.Brand;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.BrandRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {
    private final BrandRepository brandRepository;

    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<BrandDTO> getActiveBrands() {
        return brandRepository.findByIsActive(true).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public BrandDTO getBrandById(Integer id) {
        return toDTO(brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand không tồn tại với ID: " + id)));
    }

    @Transactional
    public BrandDTO createBrand(BrandDTO dto) {
        Brand brand = toEntity(dto);
        return toDTO(brandRepository.save(brand));
    }

    @Transactional
    public BrandDTO updateBrand(Integer id, BrandDTO dto) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand không tồn tại với ID: " + id));

        brand.setBrandName(dto.getBrandName());
        brand.setDescription(dto.getDescription());
        brand.setCountry(dto.getCountry());
        brand.setWebsite(dto.getWebsite());
        brand.setIsActive(dto.getIsActive());

        return toDTO(brandRepository.save(brand));
    }

    @Transactional
    public void deleteBrand(Integer id) {
        if (!brandRepository.existsById(id)) {
            throw new ResourceNotFoundException("Brand không tồn tại với ID: " + id);
        }
        brandRepository.deleteById(id);
    }

    private BrandDTO toDTO(Brand entity) {
        return new BrandDTO(
            entity.getBrandId(),
            entity.getBrandName(),
            entity.getDescription(),
            entity.getCountry(),
            entity.getWebsite(),
            entity.getIsActive()
        );
    }

    private Brand toEntity(BrandDTO dto) {
        Brand brand = new Brand();
        brand.setBrandName(dto.getBrandName());
        brand.setDescription(dto.getDescription());
        brand.setCountry(dto.getCountry());
        brand.setWebsite(dto.getWebsite());
        brand.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return brand;
    }
}
