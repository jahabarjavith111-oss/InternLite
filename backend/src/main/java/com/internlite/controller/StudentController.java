package com.internlite.controller;

import com.internlite.entity.Student;
import com.internlite.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin("*")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/profile")
    public ResponseEntity<Student> getProfile(Authentication auth) {
        return ResponseEntity.ok(studentService.getProfile(auth));
    }

    @PutMapping("/profile")
    public ResponseEntity<Student> updateProfile(Authentication auth,
                                                 @RequestBody Student details) {
        return ResponseEntity.ok(studentService.updateProfile(auth, details));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> directory(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String skill,
            Authentication auth) {
        return ResponseEntity.ok(studentService.directory(keyword, skill, auth));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> publicProfile(@PathVariable Long id,
                                                             Authentication auth) {
        return ResponseEntity.ok(studentService.publicProfile(id, auth));
    }
}
