package com.rideshare.smart_ride_sharing_system.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder.userDetailsService(customUserDetailsService).passwordEncoder(passwordEncoder());
        return authBuilder.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/auth/register", "/auth/login").permitAll()
                .requestMatchers("/auth/otp/**").permitAll() // Allow OTP authentication endpoints
                .requestMatchers("/ws/**").permitAll() // Allow WebSocket connections
                .requestMatchers("/api/realtime/**").permitAll() // Allow real-time endpoints
                .requestMatchers("/api/notifications/**").permitAll() // Allow notification endpoints
                .requestMatchers("/api/payments/**").permitAll() // Allow payment endpoints
                .requestMatchers("/api/reviews/**").permitAll() // Allow review endpoints
                .requestMatchers("/api/bookings/**").permitAll() // Allow API booking endpoints
                .requestMatchers("/api/rides/**").permitAll() // Allow API ride endpoints
                .requestMatchers("/api/users/**").permitAll() // Allow user endpoints
                .requestMatchers("/api/fare/**").permitAll() // Allow fare calculation endpoints
                .requestMatchers("/api/admin/**").permitAll() // Allow admin endpoints
                .requestMatchers("/h2-console/**").permitAll() // Allow H2 console access
                .requestMatchers("/diagnostic/**").permitAll() // Allow diagnostic endpoints
                .requestMatchers("/rides/**").permitAll() // Allow all ride endpoints
                .requestMatchers("/bookings/**").permitAll() // Allow all booking endpoints
                .anyRequest().permitAll() // TEMPORARILY ALLOW ALL - for debugging
            )
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin())) // Allow H2 console frames
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}