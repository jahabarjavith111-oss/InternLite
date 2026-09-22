package com.internlite.controller;

import com.internlite.entity.Internship;
import com.internlite.service.InternshipService;
import com.internlite.service.RecruiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/internships")
@RequiredArgsConstructor
public class InternshipController {

    private final InternshipService internshipService;
    private final RecruiterService recruiterService;

    @GetMapping
    public ResponseEntity<List<Internship>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String workType) {
        List<Internship> list = internshipService.search(keyword, location, category, workType);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Internship> getById(@PathVariable Long id) {
        return ResponseEntity.ok(internshipService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Internship> create(@RequestBody Internship internship,
                                             Authentication auth) {
        // Explicit company in body wins (legacy contract); otherwise use the
        // recruiter's own company (was: raw userId misused as companyId)
        if (internship.getCompany() != null && internship.getCompany().getCompanyId() != null) {
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(internshipService.create(internship,
                    internship.getCompany().getCompanyId()));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(recruiterService.postInternship(auth, internship));
    }
}
