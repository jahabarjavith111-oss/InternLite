package com.internlite.service;

import com.internlite.entity.*;
import com.internlite.enums.Role;
import com.internlite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepo;
    private final UserRepository userRepo;
    private final StudentSkillRepository studentSkillRepo;

    public Student getProfile(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return studentRepo.findByUserUserId(user.getUserId())
            .orElseGet(() -> {
                Student s = new Student();
                // Managed entity: principal is detached outside a session
                // (getReferenceById proxy breaks Jackson serialization)
                s.setUser(userRepo.findById(user.getUserId()).orElseThrow());
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

    /** Talent directory: email visible to recruiters/admins only. */
    public List<Map<String, Object>> directory(String keyword, String skill, Authentication auth) {
        User caller = (User) auth.getPrincipal();
        boolean showContact = caller.getRole() == Role.RECRUITER || caller.getRole() == Role.ADMIN;
        String kw = keyword == null ? "" : keyword.toLowerCase();
        String sk = skill == null ? "" : skill.toLowerCase();
        return studentRepo.findAll().stream()
            .filter(s -> {
                if (!kw.isEmpty()) {
                    String hay = ((s.getUser() != null ? s.getUser().getName() : "") + " "
                        + (s.getCollege() != null ? s.getCollege() : "") + " "
                        + (s.getDegree() != null ? s.getDegree() : "")).toLowerCase();
                    if (!hay.contains(kw)) return false;
                }
                if (!sk.isEmpty()) {
                    boolean hit = studentSkillRepo.findByStudent(s).stream()
                        .anyMatch(ss -> ss.getSkill() != null
                            && ss.getSkill().getSkillName().toLowerCase().contains(sk));
                    if (!hit) return false;
                }
                return true;
            })
            .map(s -> toCard(s, showContact))
            .collect(Collectors.toList());
    }

    public Map<String, Object> publicProfile(Long studentId, Authentication auth) {
        User caller = (User) auth.getPrincipal();
        boolean showContact = caller.getRole() == Role.RECRUITER || caller.getRole() == Role.ADMIN;
        Student s = studentRepo.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        return toCard(s, showContact);
    }

    private Map<String, Object> toCard(Student s, boolean showContact) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("studentId", s.getStudentId());
        m.put("name", s.getUser() != null ? s.getUser().getName() : null);
        if (showContact && s.getUser() != null) m.put("email", s.getUser().getEmail());
        m.put("college", s.getCollege());
        m.put("degree", s.getDegree());
        m.put("branch", s.getBranch());
        m.put("location", s.getLocation());
        m.put("bio", s.getBio());
        List<String> skills = studentSkillRepo.findByStudent(s).stream()
            .map(ss -> ss.getSkill() != null ? ss.getSkill().getSkillName() : null)
            .filter(n -> n != null)
            .collect(Collectors.toList());
        m.put("skills", skills);
        return m;
    }
}
