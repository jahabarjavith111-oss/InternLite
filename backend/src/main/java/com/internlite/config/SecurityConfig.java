package com.internlite.config;

import org.springframework.context.annotation.*;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Comma-separated list, e.g. https://internlite-frontend.onrender.com,http://localhost:5173
    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,https://internlite-frontend.onrender.com}")
    private String allowedOrigins;

    // Always allowed regardless of FRONTEND_URL — prevents 403 when the env var is wrong/missing
    private static final List<String> ALWAYS_ALLOWED_ORIGINS = List.of(
        "https://internlite-frontend.onrender.com"
    );

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtRequestFilter filter) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health", "/error").permitAll()
                // Public browsing: landing page + search work without login
                .requestMatchers(HttpMethod.GET,
                    "/",
                    "/api/health",
                    "/api/internships", "/api/internships/**",
                    "/api/jobs", "/api/jobs/**",
                    "/api/companies", "/api/companies/**",
                    "/api/categories",
                    "/api/skills",
                    "/api/external-jobs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = new ArrayList<>();
        for (String origin : allowedOrigins.split(",")) {
            // Strip whitespace and trailing slashes so FRONTEND_URL=https://...onrender.com/ still matches
            String cleaned = origin.trim().replaceAll("/+$", "");
            if (!cleaned.isEmpty() && !origins.contains(cleaned)) {
                origins.add(cleaned);
            }
        }
        for (String origin : ALWAYS_ALLOWED_ORIGINS) {
            if (!origins.contains(origin)) {
                origins.add(origin);
            }
        }
        // "*" cannot be used with allowCredentials(true); use patterns instead
        config.setAllowedOriginPatterns(origins);
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setExposedHeaders(Arrays.asList("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
