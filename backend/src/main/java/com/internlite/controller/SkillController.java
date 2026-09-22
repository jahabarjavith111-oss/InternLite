package com.internlite.controller;

import com.internlite.entity.Skill;
import com.internlite.entity.StudentSkill;
import com.internlite.repository.SkillRepository;
import com.internlite.service.StudentSkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillRepository skillRepo;
    private final StudentSkillService skillService;

    @GetMapping
    public List<Skill> allSkills() {
        return skillRepo.findAll();
    }

    @GetMapping("/student")
    public List<StudentSkill> studentSkills(Authentication auth) {
        return skillService.getStudentSkills(auth);
    }

    @PostMapping("/student/{skillId}")
    public ResponseEntity<?> addSkill(Authentication auth, @PathVariable Long skillId) {
        skillService.addSkill(auth, skillId);
        return ResponseEntity.ok("Skill added");
    }

    @DeleteMapping("/student/{skillId}")
    public ResponseEntity<?> removeSkill(Authentication auth, @PathVariable Long skillId) {
        skillService.removeSkill(auth, skillId);
        return ResponseEntity.ok("Skill removed");
    }
}
