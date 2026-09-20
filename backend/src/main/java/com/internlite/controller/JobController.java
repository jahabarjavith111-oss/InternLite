package com.internlite.controller;

import com.internlite.entity.Job;
import com.internlite.enums.InternshipStatus;
import com.internlite.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin("*")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<List<Job>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String workType) {
        return ResponseEntity.ok(jobService.search(keyword, location, category, workType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Job> create(@RequestBody Job job, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.create(job, auth));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Job> updateStatus(@PathVariable Long id, @RequestParam InternshipStatus status) {
        return ResponseEntity.ok(jobService.updateStatus(id, status));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Job>> myJobs(Authentication auth) {
        return ResponseEntity.ok(jobService.myJobs(auth));
    }
}
