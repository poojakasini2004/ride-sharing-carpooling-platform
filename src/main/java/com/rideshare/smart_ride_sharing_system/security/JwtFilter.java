package com.rideshare.smart_ride_sharing_system.security;

import com.rideshare.smart_ride_sharing_system.model.User;
import com.rideshare.smart_ride_sharing_system.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(@org.springframework.lang.NonNull HttpServletRequest request,
                                    @org.springframework.lang.NonNull HttpServletResponse response,
                                    @org.springframework.lang.NonNull FilterChain filterChain) throws ServletException, IOException {

        // Debug logging for filter
        System.out.println("JwtFilter: Incoming request URI: " + request.getRequestURI());

        // Skip JWT filter for OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check if this is a public endpoint - SKIP JWT VALIDATION COMPLETELY
        String uri = request.getRequestURI();
        boolean isPublicEndpoint = uri.equals("/auth/register") || 
            uri.equals("/auth/login") ||
            uri.equals("/rides/available") ||
            uri.equals("/rides/match") ||
            uri.startsWith("/api/fare/") ||
            uri.startsWith("/api/payments/") ||
            uri.startsWith("/api/notifications/") ||
            uri.startsWith("/api/reviews/") ||
            uri.startsWith("/api/bookings/") ||
            uri.startsWith("/api/rides/") ||
            uri.startsWith("/api/users/") ||
            uri.startsWith("/auth/otp/") ||
            uri.startsWith("/ws/") ||
            uri.startsWith("/api/realtime/") ||
            uri.startsWith("/h2-console/") ||
            uri.startsWith("/diagnostic/") ||
            (uri.startsWith("/rides/") && !uri.equals("/rides/create")) ||
            uri.startsWith("/bookings/");
            
        if (isPublicEndpoint) {
            System.out.println("JwtFilter: ✅ PUBLIC ENDPOINT - Skipping ALL authentication: " + uri);
            // For public endpoints, bypass all authentication - don't even check for tokens
            filterChain.doFilter(request, response);
            return;
        }

        // For protected endpoints, validate JWT
        final String authorizationHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                System.out.println("JwtFilter: Exception extracting username: " + e.getMessage());
            }
        }
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

                Optional<User> userOpt = userService.getUserByEmail(username);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    if (jwtUtil.validateToken(jwt, user)) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        System.out.println("JwtFilter: ✅ Token validated for user: " + username);
                    } else {
                        System.out.println("JwtFilter: ❌ Token validation failed for user: " + username);
                    }
                } else {
                    System.out.println("JwtFilter: ❌ User not found: " + username);
                }
            } catch (Exception e) {
                System.out.println("JwtFilter: ❌ Error during authentication: " + e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}