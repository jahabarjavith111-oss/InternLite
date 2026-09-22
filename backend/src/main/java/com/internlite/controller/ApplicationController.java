package com.internlite.controller;

import com.internlite.dto.ApplicationRequest;
import com.internlite.dto.StatusUpdate;
import com.internlite.entity.Application;
import com.internlite.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService appService;

    @PostMapping
    public ResponseEntity<Application> apply(Authentication auth,
                                              @RequestBody ApplicationRequest req) {
        return ResponseEntity.ok(appService.apply(req, auth));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Application>> myApplications(Authentication auth) {
        return ResponseEntity.ok(appService.studentApplications(auth));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getById(@PathVariable Long id) {
        return ResponseEntity.ok(appService.getById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Application> updateStatus(@PathVariable Long id,
                                                    @RequestBody StatusUpdate req) {
        return ResponseEntity.ok(appService.updateStatus(id, req));
    }
}
