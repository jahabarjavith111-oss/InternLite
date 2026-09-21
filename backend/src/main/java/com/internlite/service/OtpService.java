package com.internlite.service;

import com.internlite.entity.OtpVerification;
import com.internlite.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;

/**
 * DB-backed OTP store (10 min expiry, max 5 attempts).
 * Survives backend restarts. Email must be verified via
 * /verify-otp before /register succeeds.
 */
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private final EmailService emailService;
    private final OtpVerificationRepository otpRepo;

    @Value("${app.otp.expiry-minutes:10}")
    private int expiryMinutes;

    @Value("${app.otp.length:6}")
    private int otpLength;

    private final SecureRandom random = new SecureRandom();

    @Transactional
    public void sendOtp(String email, String name) {
        String key = normalize(email);
        String code = generate();
        OtpVerification entry = new OtpVerification();
        entry.setEmail(key);
        entry.setCode(code);
        entry.setExpiresAt(Instant.now().plusSeconds(expiryMinutes * 60L));
        entry.setAttempts(0);
        entry.setVerified(false);
        otpRepo.save(entry);
        try {
            emailService.sendOtpMail(email, firstNameOf(name, email), code, expiryMinutes);
        } catch (Exception e) {
            // No real SMTP in dev (localhost:25 dummy). OTP is persisted in DB;
            // log the code so local testing can proceed without a mail server.
            log.warn("SMTP send failed for {} ({}). DEV-ONLY OTP code: {}", email, e.getMessage(), code);
        }
    }

    @Transactional
    public boolean verifyOtp(String email, String otp) {
        String key = normalize(email);
        OtpVerification e = otpRepo.findById(key).orElse(null);
        if (e == null) return false;
        if (Instant.now().isAfter(e.getExpiresAt())) { otpRepo.deleteById(key); return false; }
        if (e.getAttempts() >= 5) { otpRepo.deleteById(key); return false; }
        e.setAttempts(e.getAttempts() + 1);
        if (e.getCode().equals(otp == null ? "" : otp.trim())) {
            e.setVerified(true);
            otpRepo.save(e);
            return true;
        }
        otpRepo.save(e);
        return false;
    }

    /** Consumed by register: true only if this email completed verify-otp and hasn't expired. */
    @Transactional(readOnly = true)
    public boolean isVerified(String email) {
        OtpVerification e = otpRepo.findById(normalize(email)).orElse(null);
        if (e == null || !e.isVerified()) return false;
        if (Instant.now().isAfter(e.getExpiresAt())) return false;
        return true;
    }

    @Transactional
    public void consume(String email) {
        otpRepo.deleteById(normalize(email));
    }

    private String generate() {
        int bound = (int) Math.pow(10, otpLength);
        int n = random.nextInt(bound);
        return String.format("%0" + otpLength + "d", n);
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String firstNameOf(String name, String email) {
        if (name != null && !name.isBlank()) return name.trim().split("\\s+")[0];
        if (email != null && email.contains("@")) {
            String local = email.substring(0, email.indexOf('@'));
            if (!local.isBlank()) return local;
        }
        return "there";
    }
}
