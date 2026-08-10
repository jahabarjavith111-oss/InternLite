package com.internlite.controller;

import com.internlite.entity.Application;
import com.internlite.entity.Internship;
import com.internlite.service.RecruiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruiter")
@CrossOrigin("*")
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
}
