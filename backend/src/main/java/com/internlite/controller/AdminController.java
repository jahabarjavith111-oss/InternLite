package com.internlite.controller;

import com.internlite.entity.*;
import com.internlite.enums.Role;
import com.internlite.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @org.springframework.beans.factory.annotation.Value("${app.super-admin.email:jahabarjavith111@gmail.com}")
    private String superAdminEmail;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() { return ResponseEntity.ok(adminService.stats()); }
    @GetMapping("/users")
    public ResponseEntity<List<User>> users() { return ResponseEntity.ok(adminService.users()); }
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestParam Role role) {
        User target = adminService.users().stream().filter(u -> u.getUserId().equals(id)).findFirst().orElse(null);
        if (target != null && target.getEmail().equalsIgnoreCase(superAdminEmail.trim()) && role != Role.ADMIN) {
            return ResponseEntity.status(403).body("Cannot demote super-admin " + superAdminEmail);
        }
        return ResponseEntity.ok(adminService.updateRole(id, role));
    }
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User target = adminService.users().stream().filter(u -> u.getUserId().equals(id)).findFirst().orElse(null);
        if (target != null && target.getEmail().equalsIgnoreCase(superAdminEmail.trim())) {
            return ResponseEntity.status(403).body("Cannot delete super-admin " + superAdminEmail);
        }
        adminService.deleteUser(id); return ResponseEntity.ok("Deleted"); }
    @GetMapping("/internships")
    public ResponseEntity<List<Internship>> internships() { return ResponseEntity.ok(adminService.internships()); }
    @GetMapping("/applications")
    public ResponseEntity<List<Application>> applications() { return ResponseEntity.ok(adminService.applications()); }
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> auditLogs() { return ResponseEntity.ok(adminService.auditLogs()); }
}
