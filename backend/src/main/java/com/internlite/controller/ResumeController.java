package com.internlite.controller;

import com.internlite.entity.Resume;
import com.internlite.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin("*")
@RequiredArgsConstructor
public class ResumeController {
    private final ResumeService resumeService;

    @GetMapping("/my")
    public ResponseEntity<List<Resume>> myResumes(Authentication auth) {
        return ResponseEntity.ok(resumeService.myResumes(auth));
    }

    @PostMapping
    public ResponseEntity<Resume> upload(Authentication auth, @RequestBody Resume resume) {
        return ResponseEntity.ok(resumeService.upload(auth, resume));
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<Resume> setDefault(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(resumeService.setDefault(auth, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(Authentication auth, @PathVariable Long id) {
        resumeService.delete(auth, id);
        return ResponseEntity.ok("Deleted");
    }
}
