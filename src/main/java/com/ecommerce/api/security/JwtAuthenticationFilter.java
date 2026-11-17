package com.ecommerce.api.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // Loglama
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, @Lazy UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // 1. Authorization header'ını oku
        final String authHeader = request.getHeader("Authorization");

        // 2. Header yoksa veya "Bearer " ile başlamıyorsa filtreyi pas geç
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 3. "Bearer " ön ekini kırp → ham JWT string'ini elde et
            final String jwt = authHeader.substring(7);

            // 4. Token'dan kullanıcı email/username'ini çıkar
            final String userEmail = jwtService.extractUsername(jwt);

            // 5. Kullanıcı adı varsa ve henüz doğrulanmamışsa
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 6. Kullanıcıyı veritabanından yükle
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                // 6.1 Askıya alınmış kullanıcının mevcut JWT'siyle erişimini anında engelle
                if (!userDetails.isEnabled()) {
                    log.warn("Askıya alınmış kullanıcı erişim engellendi: {}", userEmail);
                    SecurityContextHolder.clearContext();
                    filterChain.doFilter(request, response);
                    return;
                }

                // 7. Token geçerliliğini kontrol et
                if (jwtService.isTokenValid(jwt, userDetails)) {

                    // 8. Geçerli ise UsernamePasswordAuthenticationToken oluştur
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    // 9. İstek detaylarını (IP, session vb.) token'a ekle
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    // 10. Doğrulanmış kimliği SecurityContext'e set et
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (ExpiredJwtException e) {
            log.warn("JWT token süresi dolmuş: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        } catch (SignatureException e) {
            log.warn(" Geçersiz JWT imza: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        } catch (MalformedJwtException e) {
            log.warn("JWT token geçersiz formatta: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        } catch (Exception e) {
            log.error("Beklenmeyen JWT hatası: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }

        // 11. Filtre zincirini her durumda devam ettir
        filterChain.doFilter(request, response);
    }
}