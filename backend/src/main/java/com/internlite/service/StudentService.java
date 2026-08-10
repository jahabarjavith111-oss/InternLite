package com.internlite.service;

import com.internlite.entity.*;
import com.internlite.enums.Role;
import com.internlite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepo;

    public Student getProfile(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return studentRepo.findByUserId(user.getUserId())
            .orElseGet(() -> {
                Student s = new Student();
                s.setUser(user);
                return studentRepo.save(s);
            });
    }

    public Student updateProfile(Authentication auth, Student details) {
        User user = (User) auth.getPrincipal();
        Student student = getProfile(auth);
        student.setCollege(details.getCollege());
        student.setDegree(details.getDegree());
        student.setBranch(details.getBranch());
        student.setGraduationYear(details.getGraduationYear());
        student.setLocation(details.getLocation());
        student.setBio(details.getBio());
        return studentRepo.save(student);
    }
}
