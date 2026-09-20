package com.internlite.controller;

import com.internlite.entity.SavedInternship;
import com.internlite.service.SavedInternshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved")
@CrossOrigin("*")
@RequiredArgsConstructor
public class SavedInternshipController {
    private final SavedInternshipService savedService;

    @GetMapping
    public ResponseEntity<List<SavedInternship>> mySaved(Authentication auth) {
        return ResponseEntity.ok(savedService.mySaved(auth));
    }

    @PostMapping("/{internshipId}")
    public ResponseEntity<SavedInternship> save(Authentication auth, @PathVariable Long internshipId) {
        return ResponseEntity.ok(savedService.save(auth, internshipId));
    }

    @DeleteMapping("/{internshipId}")
    public ResponseEntity<?> unsave(Authentication auth, @PathVariable Long internshipId) {
        savedService.unsave(auth, internshipId);
        return ResponseEntity.ok("Removed");
    }
}
