package ut.edu.demowebbanquanao.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ut.edu.demowebbanquanao.entity.User;
import ut.edu.demowebbanquanao.repository.UserRepository;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
            .orElseThrow(() ->
                new UsernameNotFoundException("User not found with username or email: " + usernameOrEmail)
            );

        System.out.println("DEBUG - Username: " + user.getUsername());
        System.out.println("DEBUG - Password hash from DB: " + user.getPassword());
        System.out.println("DEBUG - Is Active: " + user.getIsActive());

        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            user.getIsActive(),
            true,
            true,
            true,
            getAuthorities(user)
        );
    }
    
    private Set<GrantedAuthority> getAuthorities(User user) {
        Set<GrantedAuthority> authorities = new HashSet<>();
        
        if (user.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().getRoleName()));
            
            if (user.getRole().getPermissions() != null) {
                authorities.addAll(
                    user.getRole().getPermissions().stream()
                        .map(permission -> new SimpleGrantedAuthority(permission.getPermissionName()))
                        .collect(Collectors.toSet())
                );
            }
        }
        
        return authorities;
    }
}