package com.internlite.controller;

import com.internlite.dto.JwtResponse;
import com.internlite.dto.LoginRequest;
import com.internlite.dto.RegisterRequest;
import com.internlite.entity.User;
import com.internlite.enums.Role;
import com.internlite.repository.UserRepository;
import com.internlite.service.OtpService;
import com.internlite.config.JwtUtil;
import java.util.Map;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    private final OtpService otpService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || !email.contains("@")) {
            return ResponseEntity.badRequest().body("Valid email is required");
        }
        if (userRepo.existsByEmail(email.trim())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        otpService.sendOtp(email.trim(), body.get("name"));
        return ResponseEntity.ok("OTP sent! Check your inbox for mail from InternLite (no-reply@internlite.com).");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body("Email and OTP are required");
        }
        if (otpService.verifyOtp(email.trim(), otp.trim())) {
            return ResponseEntity.ok("Email verified successfully");
        }
        return ResponseEntity.badRequest().body("Invalid or expired OTP");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        // Frontend verifies email OTP before enabling Create Account
        if (!otpService.isVerified(req.getEmail())) {
            return ResponseEntity.status(403).body("Verify your email OTP first");
        }
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());
        user.setRole(req.getRole());
        userRepo.save(user);
        otpService.consume(req.getEmail());
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || !email.contains("@")) {
            return ResponseEntity.badRequest().body("Valid email is required");
        }
        User user = userRepo.findByEmail(email.trim()).orElse(null);
        if (user == null) {
            // Same response whether or not the account exists — don't leak accounts
            return ResponseEntity.ok("If an account exists for that email, a reset code has been sent.");
        }
        otpService.sendOtp(email.trim(), user.getName());
        return ResponseEntity.ok("If an account exists for that email, a reset code has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");
        if (email == null || otp == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body("Email, OTP and a password of at least 6 characters are required");
        }
        if (!otpService.verifyOtp(email.trim(), otp.trim())) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP");
        }
        User user = userRepo.findByEmail(email.trim()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
        otpService.consume(email.trim());
        return ResponseEntity.ok("Password reset successful. You can now log in.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
            User user = userRepo.findByEmail(req.getEmail()).orElseThrow();
            UserDetails details = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
            String token = jwtUtil.generateToken(details);
            return ResponseEntity.ok(new JwtResponse(token, user.getEmail(),
                user.getRole().name(), user.getUserId(), user.getName()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
}
