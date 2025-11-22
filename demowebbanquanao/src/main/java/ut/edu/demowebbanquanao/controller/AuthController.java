package ut.edu.demowebbanquanao.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;
import ut.edu.demowebbanquanao.dto.AuthResponse;
import ut.edu.demowebbanquanao.dto.LoginRequest;
import ut.edu.demowebbanquanao.dto.RegisterRequest;
import ut.edu.demowebbanquanao.dto.UserDTO;
import ut.edu.demowebbanquanao.exception.ApiResponse;
import ut.edu.demowebbanquanao.exception.BusinessException;
import ut.edu.demowebbanquanao.exception.ErrorCode;
import ut.edu.demowebbanquanao.service.AuthService;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_REQUIRED_FIELD, "refreshToken");
        }

        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        UserDTO user = authService.getCurrentUser(username);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }

    @PostMapping("/update-profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(@RequestBody UserDTO updateData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        UserDTO updated = authService.updateProfile(username, updateData);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", updated));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody Map<String, String> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (oldPassword == null || newPassword == null) {
            throw new BusinessException(ErrorCode.VALIDATION_REQUIRED_FIELD, "oldPassword, newPassword");
        }

        authService.changePassword(username, oldPassword, newPassword);

        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }
}