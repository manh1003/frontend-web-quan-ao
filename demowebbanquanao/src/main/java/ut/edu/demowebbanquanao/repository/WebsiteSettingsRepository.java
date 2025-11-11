package ut.edu.demowebbanquanao.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ut.edu.demowebbanquanao.entity.WebsiteSettings;

@Repository
public interface WebsiteSettingsRepository extends JpaRepository<WebsiteSettings, Long> {
    Optional<WebsiteSettings> findBySettingKey(String settingKey);
    boolean existsBySettingKey(String settingKey);
}