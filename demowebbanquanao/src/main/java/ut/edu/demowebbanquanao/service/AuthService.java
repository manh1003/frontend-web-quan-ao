package ut.edu.demowebbanquanao.service;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;
import ut.edu.demowebbanquanao.dto.AuthResponse;
import ut.edu.demowebbanquanao.dto.LoginRequest;
import ut.edu.demowebbanquanao.dto.RegisterRequest;
import ut.edu.demowebbanquanao.dto.UserDTO;
import ut.edu.demowebbanquanao.entity.Customer;
import ut.edu.demowebbanquanao.entity.Role;
import ut.edu.demowebbanquanao.entity.User;
import ut.edu.demowebbanquanao.exception.AuthenticationException;
import ut.edu.demowebbanquanao.exception.BusinessException;
import ut.edu.demowebbanquanao.exception.ErrorCode;
import ut.edu.demowebbanquanao.exception.ResourceNotFoundException;
import ut.edu.demowebbanquanao.repository.CustomerRepository;
import ut.edu.demowebbanquanao.repository.RoleRepository;
import ut.edu.demowebbanquanao.repository.UserRepository;
import ut.edu.demowebbanquanao.security.JwtTokenProvider;

@Slf4j
@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse register(RegisterRequest request) {
        log.info("Registration attempt: username={}, email={}", request.getUsername(), request.getEmail());

        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Registration failed - username exists: username={}", request.getUsername());
            throw new BusinessException(ErrorCode.AUTH_USERNAME_EXISTS);
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed - email exists: email={}", request.getEmail());
            throw new BusinessException(ErrorCode.AUTH_EMAIL_EXISTS);
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setIsActive(true);
        user.setEmailVerified(false);

        Role role;
        if (request.getRoleId() != null) {
            role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> {
                        log.warn("Role not found: roleId={}", request.getRoleId());
                        return new ResourceNotFoundException(ErrorCode.USER_ROLE_NOT_FOUND);
                    });
        } else {
            role = roleRepository.findByRoleName("CUSTOMER")
                    .orElseThrow(() -> {
                        log.error("Default CUSTOMER role not found in database");
                        return new ResourceNotFoundException(ErrorCode.USER_ROLE_NOT_FOUND);
                    });
        }
        user.setRole(role);

        user = userRepository.save(user);

        // If user is a CUSTOMER, automatically create a Customer record
        if ("CUSTOMER".equals(role.getRoleName())) {
            Customer customer = new Customer();
            customer.setEmail(user.getEmail());
            customer.setPhone(user.getPhone());
            customer.setFullName(user.getFullName());
            customer.setCustomerTier(Customer.CustomerTier.NEW);
            customer.setTotalOrders(0);
            customer.setTotalSpent(java.math.BigDecimal.ZERO);
            customerRepository.save(customer);
        }

        String accessToken = tokenProvider.generateToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        log.info("User registered successfully: userId={}, username={}, email={}",
                user.getUserId(), user.getUsername(), user.getEmail());

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt: usernameOrEmail={}", request.getUsernameOrEmail());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsernameOrEmail(),
                            request.getPassword()));

            User user = userRepository.findByUsernameOrEmail(
                    request.getUsernameOrEmail(),
                    request.getUsernameOrEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed - user not found: usernameOrEmail={}", request.getUsernameOrEmail());
                    return new AuthenticationException(ErrorCode.AUTH_INVALID_CREDENTIALS);
                });

            // Check if user is active
            if (!user.getIsActive()) {
                log.warn("Login failed - user disabled: username={}", user.getUsername());
                throw new AuthenticationException(ErrorCode.AUTH_USER_DISABLED);
            }

            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            String accessToken = tokenProvider.generateToken(user);
            String refreshToken = tokenProvider.generateRefreshToken(user);

            log.info("Login successful: userId={}, username={}", user.getUserId(), user.getUsername());

            return buildAuthResponse(user, accessToken, refreshToken);
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.warn("Login failed - invalid credentials: usernameOrEmail={}", request.getUsernameOrEmail());
            throw new AuthenticationException(ErrorCode.AUTH_INVALID_CREDENTIALS);
        }
    }

    public AuthResponse refreshToken(String refreshToken) {
        log.debug("Refresh token attempt");

        if (!tokenProvider.validateToken(refreshToken)) {
            log.warn("Refresh token invalid or expired");
            throw new AuthenticationException(ErrorCode.AUTH_REFRESH_TOKEN_EXPIRED);
        }

        String username = tokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("User not found for refresh token: username={}", username);
                    return new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND);
                });

        String newAccessToken = tokenProvider.generateToken(user);
        String newRefreshToken = tokenProvider.generateRefreshToken(user);

        log.info("Token refreshed: userId={}, username={}", user.getUserId(), user.getUsername());

        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    public UserDTO getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));

        return convertToUserDTO(user);
    }

    @Transactional
    public UserDTO updateProfile(String username, UserDTO updateData) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));

        // Check if email is being changed and already exists
        if (updateData.getEmail() != null && !updateData.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updateData.getEmail())) {
                log.warn("Profile update failed - email exists: email={}", updateData.getEmail());
                throw new BusinessException(ErrorCode.AUTH_EMAIL_EXISTS);
            }
            user.setEmail(updateData.getEmail());
        }

        // Update fields
        if (updateData.getFullName() != null) {
            user.setFullName(updateData.getFullName());
        }
        if (updateData.getPhone() != null) {
            user.setPhone(updateData.getPhone());
        }

        user = userRepository.save(user);

        log.info("Profile updated: userId={}, username={}", user.getUserId(), user.getUsername());

        return convertToUserDTO(user);
    }

    @Transactional
    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            log.warn("Change password failed - invalid old password: username={}", username);
            throw new BusinessException(ErrorCode.USER_INVALID_PASSWORD);
        }

        // Validate new password
        if (newPassword == null || newPassword.length() < 6) {
            throw new BusinessException(ErrorCode.VALIDATION_INVALID_FORMAT, "mật khẩu");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password changed: userId={}, username={}", user.getUserId(), user.getUsername());
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationTime())
                .user(convertToUserDTO(user))
                .permissions(user.getRole() != null && user.getRole().getPermissions() != null
                        ? user.getRole().getPermissions().stream()
                                .map(p -> p.getPermissionName())
                                .collect(Collectors.toSet())
                        : null)
                .build();
    }

    private UserDTO convertToUserDTO(User user) {
        return UserDTO.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .roleName(user.getRole() != null ? user.getRole().getRoleName() : null)
                .permissions(user.getRole() != null && user.getRole().getPermissions() != null
                        ? user.getRole().getPermissions().stream()
                                .map(p -> p.getPermissionName())
                                .collect(Collectors.toSet())
                        : null)
                .isActive(user.getIsActive())
                .emailVerified(user.getEmailVerified())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .build();
    }
}