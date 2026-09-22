package com.internlite.controller;

import com.internlite.entity.Application;
import com.internlite.entity.Company;
import com.internlite.entity.Internship;
import com.internlite.service.RecruiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
public class RecruiterController {

    private final RecruiterService recruiterService;

    @GetMapping("/internships")
    public ResponseEntity<List<Internship>> myInternships(Authentication auth) {
        return ResponseEntity.ok(recruiterService.myInternships(auth));
    }

    @GetMapping("/internships/{id}/applications")
    public ResponseEntity<List<Application>> applications(@PathVariable Long id) {
        return ResponseEntity.ok(recruiterService.applicationsForInternship(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats(Authentication auth) {
        return ResponseEntity.ok(recruiterService.stats(auth));
    }

    @GetMapping("/company")
    public ResponseEntity<Company> myCompany(Authentication auth) {
        return ResponseEntity.ok(recruiterService.myCompany(auth));
    }

    @PostMapping("/internships")
    public ResponseEntity<Internship> postInternship(Authentication auth,
                                                     @RequestBody Internship internship) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(recruiterService.postInternship(auth, internship));
    }

    @PutMapping("/internships/{id}")
    public ResponseEntity<Internship> updateInternship(Authentication auth,
                                                       @PathVariable Long id,
                                                       @RequestBody Internship internship) {
        return ResponseEntity.ok(recruiterService.updateInternship(auth, id, internship));
    }

    @PutMapping("/internships/{id}/status")
    public ResponseEntity<Internship> updateInternshipStatus(Authentication auth,
                                                             @PathVariable Long id,
                                                             @RequestParam String status) {
        return ResponseEntity.ok(recruiterService.updateInternshipStatus(auth, id, status));
    }
}
