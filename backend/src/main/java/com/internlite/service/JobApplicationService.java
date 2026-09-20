package com.internlite.service;

import com.internlite.dto.JobApplicationRequest;
import com.internlite.dto.StatusUpdate;
import com.internlite.entity.*;
import com.internlite.enums.ApplicationStatus;
import com.internlite.enums.NotificationType;
import com.internlite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class JobApplicationService {
    private final JobApplicationRepository jobAppRepo;
    private final JobRepository jobRepo;
    private final StudentRepository studentRepo;
    private final ResumeRepository resumeRepo;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public JobApplication apply(JobApplicationRequest req, Authentication auth) {
        User user = (User) auth.getPrincipal();
        Student student = studentRepo.findByUserUserId(user.getUserId()).orElseThrow();
        Job job = jobRepo.findById(req.getJobId()).orElseThrow();
        if (jobAppRepo.existsByJobAndStudent(job, student)) {
            throw new RuntimeException("Already applied");
        }
        JobApplication app = new JobApplication();
        app.setJob(job);
        app.setStudent(student);
        if (req.getResumeId() != null) app.setResume(resumeRepo.findById(req.getResumeId()).orElse(null));
        app.setCoverLetter(req.getCoverLetter());
        app.setStatus(ApplicationStatus.APPLIED);
        JobApplication saved = jobAppRepo.save(app);
        notificationService.notifyUser(user, null, "Job application submitted for " + job.getTitle(), NotificationType.APPLICATION);
        auditLogService.log(user, "JOB_APPLICATION_SUBMITTED", "JobApplication", saved.getApplicationId(), job.getTitle());
        return saved;
    }

    public List<JobApplication> myApplications(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Student student = studentRepo.findByUserUserId(user.getUserId()).orElseThrow();
        return jobAppRepo.findByStudent(student);
    }

    public List<JobApplication> applicationsForJob(Long jobId) {
        Job job = jobRepo.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        return jobAppRepo.findByJob(job);
    }

    public JobApplication getById(Long id) {
        return jobAppRepo.findById(id).orElseThrow(() -> new RuntimeException("Job application not found"));
    }

    public JobApplication updateStatus(Long id, StatusUpdate req) {
        JobApplication app = getById(id);
        app.setStatus(req.getStatus());
        JobApplication saved = jobAppRepo.save(app);
        notificationService.notifyUser(app.getStudent().getUser(), null,
            "Your job application status: " + req.getStatus(), NotificationType.APPLICATION);
        return saved;
    }

    public void withdraw(Long id, Authentication auth) {
        JobApplication app = getById(id);
        app.setStatus(ApplicationStatus.WITHDRAWN);
        jobAppRepo.save(app);
    }
}
