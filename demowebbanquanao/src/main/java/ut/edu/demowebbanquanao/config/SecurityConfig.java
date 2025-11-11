package ut.edu.demowebbanquanao.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import ut.edu.demowebbanquanao.security.JwtAuthenticationFilter;
import ut.edu.demowebbanquanao.service.CustomUserDetailsService;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(
                Arrays.asList("http://localhost:3000", "http://localhost:5173", "http://localhost:5000"));
        configuration.setAllowedMethods(Arrays.asList("*"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        // Public catalog read endpoints
                        .requestMatchers(HttpMethod.GET,
                                // Explicit base paths
                                "/api/products", "/api/products/**",
                                "/api/product-variants", "/api/product-variants/**",
                                "/api/brands", "/api/brands/**",
                                "/api/categories", "/api/categories/**",
                                "/api/product-categories", "/api/product-categories/**",
                                "/api/product-images", "/api/product-images/**",
                                "/api/banners/active", "/api/banners/current")
                        .permitAll()
                        // Admin/Manager only endpoints
                        .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "MANAGER")
                        // Settings: GET is public, PUT/POST/DELETE require ADMIN/MANAGER
                        .requestMatchers(HttpMethod.GET, "/api/settings", "/api/settings/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/settings").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/settings/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PATCH, "/api/settings/**").hasAnyRole("ADMIN", "MANAGER")
                        // Customer can create orders and view their own orders
                        .requestMatchers(HttpMethod.POST, "/api/orders").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/orders/**").authenticated()
                        // Customer can update shipping address for their pending/confirmed orders
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/*/shipping-address").authenticated()
                        // Only staff can update order status
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/*/status")
                        .hasAnyRole("ADMIN", "MANAGER", "SALES", "WAREHOUSE")
                        // Customer can manage their addresses
                        .requestMatchers("/api/customer-addresses/**").authenticated()
                        // Customer endpoints - More specific patterns first!
                        .requestMatchers(HttpMethod.GET, "/api/customers/by-email/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/customers").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/customers/**").hasAnyRole("ADMIN", "MANAGER", "SALES")
                        .requestMatchers(HttpMethod.PUT, "/api/customers/**").hasAnyRole("ADMIN", "MANAGER", "SALES")
                        // Management endpoints that need authentication
                        .requestMatchers(HttpMethod.GET, "/api/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/**")
                        .hasAnyRole("ADMIN", "MANAGER", "SALES", "WAREHOUSE", "ACCOUNTANT")
                        .requestMatchers(HttpMethod.PUT, "/api/**")
                        .hasAnyRole("ADMIN", "MANAGER", "SALES", "WAREHOUSE", "ACCOUNTANT")
                        .requestMatchers(HttpMethod.DELETE, "/api/**").hasAnyRole("ADMIN", "MANAGER")
                        // Everything else requires auth
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
