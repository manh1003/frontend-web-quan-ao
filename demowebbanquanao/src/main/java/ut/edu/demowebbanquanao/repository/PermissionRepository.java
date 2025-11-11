package ut.edu.demowebbanquanao.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.edu.demowebbanquanao.entity.Permission;

import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    
    Optional<Permission> findByPermissionName(String permissionName);
    
    Boolean existsByPermissionName(String permissionName);
}