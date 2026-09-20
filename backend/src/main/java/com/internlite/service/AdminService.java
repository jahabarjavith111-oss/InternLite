package com.internlite.service;

import com.internlite.entity.*;
import com.internlite.enums.Role;
import com.internlite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepo;
    private final CompanyRepository companyRepo;
    private final InternshipRepository internshipRepo;
    private final ApplicationRepository appRepo;
    private final AuditLogRepository auditRepo;
    public Map<String, Object> stats() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalUsers", userRepo.count());
        m.put("totalStudents", userRepo.findByRole(Role.STUDENT).size());
        m.put("totalRecruiters", userRepo.findByRole(Role.RECRUITER).size());
        m.put("totalCompanies", companyRepo.count());
        m.put("totalInternships", internshipRepo.count());
        m.put("totalApplications", appRepo.count());
        return m;
    }
    public List<User> users() { return userRepo.findAll(); }
    public User updateRole(Long id, Role role) {
        User u = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        u.setRole(role);
        return userRepo.save(u);
    }
    public void deleteUser(Long id) { userRepo.deleteById(id); }
    public List<Internship> internships() { return internshipRepo.findAll(); }
    public List<Application> applications() { return appRepo.findAll(); }
    public List<AuditLog> auditLogs() { return auditRepo.findAll(); }
}
