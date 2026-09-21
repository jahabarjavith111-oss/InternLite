package com.internlite.service;

import com.internlite.entity.*;
import com.internlite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeService {
    private final ResumeRepository resumeRepo;
    private final StudentRepository studentRepo;
    private final StudentService studentService;

    public List<Resume> myResumes(Authentication auth) {
        Student student = studentService.getProfile(auth);
        return resumeRepo.findByStudent(student);
    }

    public Resume upload(Authentication auth, Resume resume) {
        Student student = studentService.getProfile(auth);
        resume.setStudent(student);
        resume.setUploadedAt(java.time.LocalDateTime.now());
        List<Resume> existing = resumeRepo.findByStudent(student);
        if (existing.isEmpty()) resume.setDefault(true);
        if (resume.isDefault()) {
            existing.forEach(r -> { r.setDefault(false); resumeRepo.save(r); });
            resume.setDefault(true);
        }
        return resumeRepo.save(resume);
    }

    public Resume setDefault(Authentication auth, Long resumeId) {
        Student student = studentService.getProfile(auth);
        List<Resume> all = resumeRepo.findByStudent(student);
        Resume target = resumeRepo.findById(resumeId).orElseThrow(() -> new RuntimeException("Resume not found"));
        all.forEach(r -> { r.setDefault(false); resumeRepo.save(r); });
        target.setDefault(true);
        return resumeRepo.save(target);
    }

    public void delete(Authentication auth, Long resumeId) {
        resumeRepo.deleteById(resumeId);
    }
}
