package com.internlite.config;

import com.internlite.enums.Role;
import com.internlite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class SuperAdminInitializer implements CommandLineRunner {

    private final UserRepository userRepo;

    @Value("${app.super-admin.email:jahabarjavith111@gmail.com}")
    private String superAdminEmail;

    @Override
    @Transactional
    public void run(String... args) {
        String email = superAdminEmail.trim().toLowerCase();
        // Promote super-admin to ADMIN if present. Never demote other admins —
        // they may have been promoted intentionally after signup.
        userRepo.findByEmail(email).ifPresentOrElse(user -> {
            if (user.getRole() != Role.ADMIN) {
                user.setRole(Role.ADMIN);
                userRepo.save(user);
                log.info("Promoted super-admin {} to ADMIN", email);
            } else {
                log.info("Super-admin {} already ADMIN", email);
            }
        }, () -> log.info("Super-admin {} not yet registered — will be auto-promoted on signup", email));
    }
}
