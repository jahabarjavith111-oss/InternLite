package com.internlite.service;

import com.internlite.dto.ApplicationRequest;
import com.internlite.dto.StatusUpdate;
import com.internlite.entity.*;
import com.internlite.enums.ApplicationStatus;
import com.internlite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository appRepo;
    private final InternshipRepository internshipRepo;
    private final StudentRepository studentRepo;
    private final ResumeRepository resumeRepo;
    private final NotificationService notificationService;
    private final UserRepository userRepo;

    private Student getOrCreateStudent(User user) {
        return studentRepo.findByUserUserId(user.getUserId()).orElseGet(() -> {
            Student s = new Student();
            s.setUser(userRepo.findById(user.getUserId()).orElseThrow());
            return studentRepo.save(s);
        });
    }

    public Application apply(ApplicationRequest req, Authentication auth) {
        User user = (User) auth.getPrincipal();
        Student student = getOrCreateStudent(user);
        Internship internship = internshipRepo.findById(req.getInternshipId()).orElseThrow();

        if (appRepo.existsByInternshipAndStudent(internship, student)) {
            throw new com.internlite.config.DuplicateApplicationException("You have already applied to this internship");
        }
        Application app = new Application();
        app.setInternship(internship);
        app.setStudent(student);
        app.setResume(req.getResumeId() == null ? null : resumeRepo.findById(req.getResumeId()).orElse(null));
        app.setCoverLetter(req.getCoverLetter());
        app.setStatus(ApplicationStatus.APPLIED);

        Application saved = appRepo.save(app);
        notificationService.notifyStudent(student, saved, "Application submitted");
        return saved;
    }

    public List<Application> studentApplications(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Student student = getOrCreateStudent(user);
        return appRepo.findByStudent(student);
    }

    public Application updateStatus(Long id, StatusUpdate req) {
        Application app = appRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        app.setStatus(req.getStatus());
        Application saved = appRepo.save(app);
        notificationService.notifyStudent(app.getStudent(), saved, "Status: " + req.getStatus());
        return saved;
    }

    public Application getById(Long id) {
        return appRepo.findById(id).orElseThrow(() -> new RuntimeException("Application not found"));
    }
}
