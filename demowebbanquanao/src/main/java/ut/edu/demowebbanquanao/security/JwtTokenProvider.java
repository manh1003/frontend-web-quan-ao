package ut.edu.demowebbanquanao.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import ut.edu.demowebbanquanao.entity.User;

@Component
@Slf4j
public class JwtTokenProvider {
    
    @Value("${jwt.secret:your-super-secret-key-min-256-bits-long-enough-for-hs512}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}")
    private int jwtExpirationMs;
    
    @Value("${jwt.refresh.expiration:604800000}")
    private int refreshTokenExpirationMs;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
    
    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
        
        return Jwts.builder()
            .subject(user.getUsername())
            .claim("userId", user.getUserId())
            .claim("email", user.getEmail())
            .claim("fullName", user.getFullName())
            .claim("role", user.getRole() != null ? user.getRole().getRoleName() : "")
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }
    
    public String generateRefreshToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpirationMs);
        
        return Jwts.builder()
            .subject(user.getUsername())
            .claim("userId", user.getUserId())
            .claim("type", "REFRESH")
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException ex) {
            log.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty");
        }
        return false;
    }
    
    public String getUsernameFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
            return claims.getSubject();
        } catch (Exception e) {
            log.error("Error getting username from token: {}", e.getMessage());
            return null;
        }
    }
    
    public Integer getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
            return claims.get("userId", Integer.class);
        } catch (Exception e) {
            log.error("Error getting userId from token: {}", e.getMessage());
            return null;
        }
    }
    
    public Date getExpirationFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
            return claims.getExpiration();
        } catch (Exception e) {
            log.error("Error getting expiration from token: {}", e.getMessage());
            return null;
        }
    }
    
    public boolean isTokenExpired(String token) {
        Date expiration = getExpirationFromToken(token);
        return expiration != null && expiration.before(new Date());
    }
    
    public long getExpirationTime() {
        return jwtExpirationMs;
    }
}