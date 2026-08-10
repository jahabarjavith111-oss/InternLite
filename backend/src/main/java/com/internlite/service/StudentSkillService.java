package com.internlite.service;

import com.internlite.entity.*;
import com.internlite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.*;

@Service
@RequiredArgsConstructor
public class StudentSkillService {

    private final StudentRepository studentRepo;
    private final SkillRepository skillRepo;
    private final StudentSkillRepository studentSkillRepo;

    public List<StudentSkill> getStudentSkills(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Student student = studentRepo.findByUserId(user.getUserId()).orElseThrow();
        return studentSkillRepo.findByStudent(student);
    }

    public void addSkill(Authentication auth, Long skillId) {
        User user = (User) auth.getPrincipal();
        Student student = studentRepo.findByUserId(user.getUserId()).orElseThrow();
        Skill skill = skillRepo.findById(skillId).orElseThrow();
        if (!studentSkillRepo.findByStudent(student).stream()
                .anyMatch(ss -> ss.getSkill().getSkillId().equals(skillId))) {
            StudentSkill ss = new StudentSkill();
            ss.setStudent(student);
            ss.setSkill(skill);
            studentSkillRepo.save(ss);
        }
    }

    public void removeSkill(Authentication auth, Long skillId) {
        User user = (User) auth.getPrincipal();
        Student student = studentRepo.findByUserId(user.getUserId()).orElseThrow();
        studentSkillRepo.deleteByStudentAndSkill(student,
            skillRepo.findById(skillId).orElseThrow());
    }
}
