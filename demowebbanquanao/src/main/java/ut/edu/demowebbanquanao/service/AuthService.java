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

import ut.edu.demowebbanquanao.dto.AuthResponse;
import ut.edu.demowebbanquanao.dto.LoginRequest;
import ut.edu.demowebbanquanao.dto.RegisterRequest;
import ut.edu.demowebbanquanao.dto.UserDTO;
import ut.edu.demowebbanquanao.entity.Customer;
import ut.edu.demowebbanquanao.entity.Role;
import ut.edu.demowebbanquanao.entity.User;
import ut.edu.demowebbanquanao.repository.CustomerRepository;
import ut.edu.demowebbanquanao.repository.RoleRepository;
import ut.edu.demowebbanquanao.repository.UserRepository;
import ut.edu.demowebbanquanao.security.JwtTokenProvider;

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
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã được sử dụng");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
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
                    .orElseThrow(() -> new RuntimeException("Role không tồn tại"));
        } else {
            role = roleRepository.findByRoleName("CUSTOMER")
                    .orElseThrow(() -> new RuntimeException("Role mặc định không tồn tại"));
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

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()));

        User user = userRepository.findByUsernameOrEmail(
                request.getUsernameOrEmail(),
                request.getUsernameOrEmail()).orElseThrow(() -> new RuntimeException("User không tồn tại"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = tokenProvider.generateToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Refresh token không hợp lệ");
        }

        String username = tokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        String newAccessToken = tokenProvider.generateToken(user);
        String newRefreshToken = tokenProvider.generateRefreshToken(user);

        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    public UserDTO getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        return convertToUserDTO(user);
    }

    @Transactional
    public UserDTO updateProfile(String username, UserDTO updateData) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // Check if email is being changed and already exists
        if (updateData.getEmail() != null && !updateData.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updateData.getEmail())) {
                throw new RuntimeException("Email đã được sử dụng");
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
        return convertToUserDTO(user);
    }

    @Transactional
    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        // Validate new password
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
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