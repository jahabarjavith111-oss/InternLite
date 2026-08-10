package com.internlite.controller;

import com.internlite.entity.Student;
import com.internlite.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
}
