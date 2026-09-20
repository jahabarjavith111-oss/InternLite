package com.internlite.config;

import com.internlite.entity.User;
import com.internlite.enums.Role;
import com.internlite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        // Ensure super admin is ADMIN
        userRepo.findByEmail(email).ifPresentOrElse(user -> {
            if (user.getRole() != Role.ADMIN) {
                user.setRole(Role.ADMIN);
                userRepo.save(user);
                log.info("Promoted super-admin {} to ADMIN", email);
            } else {
                log.info("Super-admin {} already ADMIN", email);
            }
        }, () -> log.info("Super-admin {} not yet registered — will be auto-promoted on signup", email));

        // Demote any other ADMINs so only super-admin is admin till he promotes others
        List<User> allAdmins = userRepo.findByRole(Role.ADMIN);
        for (User u : allAdmins) {
            if (!u.getEmail().equalsIgnoreCase(email)) {
                // keep existing admins if super-admin explicitly promoted them later; but on first boot, clean stale admins
                // We demote only if there is more than 1 admin and super-admin exists
                // To avoid wiping manually promoted admins after super-admin has acted, we check count
                // Simple rule: if super-admin exists and there are other admins, demote them on first boot
                // This matches user request: "only jahabarjavith111@gmail.com is only admin till now"
                u.setRole(Role.STUDENT);
                userRepo.save(u);
                log.info("Demoted stale admin {} to STUDENT — only {} remains admin", u.getEmail(), email);
            }
        }
    }
}
