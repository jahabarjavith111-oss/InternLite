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

    public Application apply(ApplicationRequest req, Authentication auth) {
        User user = (User) auth.getPrincipal();
        Student student = studentRepo.findByUserUserId(user.getUserId()).orElseThrow();
        Internship internship = internshipRepo.findById(req.getInternshipId()).orElseThrow();

        if (appRepo.existsByInternshipAndStudent(internship, student)) {
            throw new RuntimeException("Already applied");
        }
        Application app = new Application();
        app.setInternship(internship);
        app.setStudent(student);
        app.setResume(resumeRepo.findById(req.getResumeId()).orElse(null));
        app.setCoverLetter(req.getCoverLetter());
        app.setStatus(ApplicationStatus.APPLIED);

        Application saved = appRepo.save(app);
        notificationService.notifyStudent(student, saved, "Application submitted");
        return saved;
    }

    public List<Application> studentApplications(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Student student = studentRepo.findByUserUserId(user.getUserId()).orElseThrow();
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
