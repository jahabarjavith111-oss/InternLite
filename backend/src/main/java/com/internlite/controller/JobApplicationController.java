package com.internlite.controller;

import com.internlite.dto.JobApplicationRequest;
import com.internlite.dto.StatusUpdate;
import com.internlite.entity.JobApplication;
import com.internlite.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/job-applications")
@CrossOrigin("*")
@RequiredArgsConstructor
public class JobApplicationController {
    private final JobApplicationService jobAppService;

    @PostMapping
    public ResponseEntity<JobApplication> apply(Authentication auth, @RequestBody JobApplicationRequest req) {
        return ResponseEntity.ok(jobAppService.apply(req, auth));
    }

    @GetMapping("/my")
    public ResponseEntity<List<JobApplication>> myApplications(Authentication auth) {
        return ResponseEntity.ok(jobAppService.myApplications(auth));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplication>> forJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobAppService.applicationsForJob(jobId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getById(@PathVariable Long id) {
        return ResponseEntity.ok(jobAppService.getById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<JobApplication> updateStatus(@PathVariable Long id, @RequestBody StatusUpdate req) {
        return ResponseEntity.ok(jobAppService.updateStatus(id, req));
    }

    @PutMapping("/{id}/withdraw")
    public ResponseEntity<?> withdraw(@PathVariable Long id, Authentication auth) {
        jobAppService.withdraw(id, auth);
        return ResponseEntity.ok("Withdrawn");
    }
}
