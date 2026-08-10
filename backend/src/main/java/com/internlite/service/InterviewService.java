package com.internlite.service;

import com.internlite.entity.*;
import com.internlite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepo;
    private final ApplicationRepository appRepo;
    private final NotificationService notificationService;

    public Interview schedule(Long applicationId, Interview interview) {
        Application app = appRepo.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        interview.setApplication(app);
        interview.setStatus(com.internlite.enums.InterviewStatus.SCHEDULED);
        Interview saved = interviewRepo.save(interview);
        notificationService.notifyStudent(app.getStudent(), app, "Interview scheduled");
        return saved;
    }

    public Optional<Interview> getByApplication(Long applicationId) {
        return interviewRepo.findByApplication(
            appRepo.findById(applicationId).orElseThrow());
    }

    public Interview updateStatus(Long id, String status) {
        Interview interview = interviewRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Interview not found"));
        interview.setStatus(com.internlite.enums.InterviewStatus.valueOf(status));
        return interviewRepo.save(interview);
    }
}
