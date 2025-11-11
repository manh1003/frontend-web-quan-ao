package ut.edu.demowebbanquanao.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.edu.demowebbanquanao.dto.SupplierDTO;
import ut.edu.demowebbanquanao.entity.Supplier;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.SupplierRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepository supplierRepository;

    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SupplierDTO> getActiveSuppliers() {
        return supplierRepository.findByIsActive(true).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public SupplierDTO getSupplierById(Integer id) {
        return toDTO(supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier không tồn tại với ID: " + id)));
    }

    @Transactional
    public SupplierDTO createSupplier(SupplierDTO dto) {
        Supplier supplier = toEntity(dto);
        return toDTO(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierDTO updateSupplier(Integer id, SupplierDTO dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier không tồn tại với ID: " + id));

        supplier.setSupplierName(dto.getSupplierName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setPhone(dto.getPhone());
        supplier.setEmail(dto.getEmail());
        supplier.setAddress(dto.getAddress());
        supplier.setTaxCode(dto.getTaxCode());
        supplier.setPaymentTerms(dto.getPaymentTerms());
        supplier.setNotes(dto.getNotes());
        supplier.setIsActive(dto.getIsActive());

        return toDTO(supplierRepository.save(supplier));
    }

    @Transactional
    public void deleteSupplier(Integer id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier không tồn tại với ID: " + id);
        }
        supplierRepository.deleteById(id);
    }

    private SupplierDTO toDTO(Supplier entity) {
        return new SupplierDTO(
            entity.getSupplierId(),
            entity.getSupplierName(),
            entity.getContactPerson(),
            entity.getPhone(),
            entity.getEmail(),
            entity.getAddress(),
            entity.getTaxCode(),
            entity.getPaymentTerms(),
            entity.getNotes(),
            entity.getIsActive()
        );
    }

    private Supplier toEntity(SupplierDTO dto) {
        Supplier supplier = new Supplier();
        supplier.setSupplierName(dto.getSupplierName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setPhone(dto.getPhone());
        supplier.setEmail(dto.getEmail());
        supplier.setAddress(dto.getAddress());
        supplier.setTaxCode(dto.getTaxCode());
        supplier.setPaymentTerms(dto.getPaymentTerms());
        supplier.setNotes(dto.getNotes());
        supplier.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return supplier;
    }
}
