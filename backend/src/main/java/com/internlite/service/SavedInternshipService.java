package com.internlite.service;

import com.internlite.entity.*;
import com.internlite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedInternshipService {
    private final SavedInternshipRepository savedRepo;
    private final StudentRepository studentRepo;
    private final InternshipRepository internshipRepo;

    public SavedInternship save(Authentication auth, Long internshipId) {
        User user = (User) auth.getPrincipal();
        Student student = studentRepo.findByUserUserId(user.getUserId()).orElseThrow();
        Internship internship = internshipRepo.findById(internshipId).orElseThrow(() -> new RuntimeException("Internship not found"));
        if (savedRepo.existsByStudentAndInternship(student, internship)) throw new RuntimeException("Already saved");
        SavedInternship s = new SavedInternship();
        s.setStudent(student);
        s.setInternship(internship);
        s.setSavedAt(java.time.LocalDateTime.now());
        return savedRepo.save(s);
    }

    public List<SavedInternship> mySaved(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Student student = studentRepo.findByUserUserId(user.getUserId()).orElseThrow();
        return savedRepo.findByStudent(student);
    }

    public void unsave(Authentication auth, Long internshipId) {
        User user = (User) auth.getPrincipal();
        Student student = studentRepo.findByUserUserId(user.getUserId()).orElseThrow();
        Internship internship = internshipRepo.findById(internshipId).orElseThrow();
        savedRepo.findByStudent(student).stream()
            .filter(s -> s.getInternship().getInternshipId().equals(internshipId))
            .findFirst().ifPresent(savedRepo::delete);
    }
}
