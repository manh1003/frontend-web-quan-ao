package ut.edu.demowebbanquanao.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.edu.demowebbanquanao.entity.ProductCategory;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.ProductCategoryRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {

    private final ProductCategoryRepository categoryRepository;

    public List<ProductCategory> getAllCategories() {
        return categoryRepository.findByIsActiveTrue();
    }

    public ProductCategory getCategoryById(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));
    }

    @Transactional
    public ProductCategory createCategory(ProductCategory category) {
        return categoryRepository.save(category);
    }

    @Transactional
    public ProductCategory updateCategory(Integer id, ProductCategory categoryDetails) {
        ProductCategory category = getCategoryById(id);
        category.setCategoryName(categoryDetails.getCategoryName());
        category.setDescription(categoryDetails.getDescription());
        category.setParentCategoryId(categoryDetails.getParentCategoryId());
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Integer id) {
        ProductCategory category = getCategoryById(id);
        category.setIsActive(false);
        categoryRepository.save(category);
    }
}
