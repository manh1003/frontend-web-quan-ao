package ut.edu.demowebbanquanao.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ut.edu.demowebbanquanao.dto.ReportDTO;
import ut.edu.demowebbanquanao.service.ReportService;

import java.time.ZonedDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<ReportDTO> getDashboardReport() {
        return ResponseEntity.ok(reportService.getDashboardReport());
    }

    @GetMapping("/sales")
    public ResponseEntity<ReportDTO> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime endDate) {
        return ResponseEntity.ok(reportService.getSalesReport(startDate, endDate));
    }

    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> getInventoryReport() {
        return ResponseEntity.ok(reportService.getInventoryReport());
    }

    @GetMapping("/order-status")
    public ResponseEntity<Map<String, Long>> getOrderStatusReport() {
        return ResponseEntity.ok(reportService.getOrderStatusReport());
    }
}
