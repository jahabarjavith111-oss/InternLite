package com.internlite.service;

import com.internlite.entity.*;
import com.internlite.enums.InternshipStatus;
import com.internlite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.*;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final InternshipRepository internshipRepo;
    private final StudentRepository studentRepo;
    private final StudentSkillRepository studentSkillRepo;
    public List<Map<String, Object>> recommend(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Student student = studentRepo.findByUserUserId(user.getUserId()).orElseThrow();
        Set<String> skills = studentSkillRepo.findByStudent(student).stream()
            .map(ss -> ss.getSkill().getSkillName().toLowerCase()).collect(Collectors.toSet());
        List<Internship> open = internshipRepo.findByStatus(InternshipStatus.OPEN);
        List<Map<String, Object>> scored = new ArrayList<>();
        for (Internship i : open) {
            String req = i.getRequiredSkills() == null ? "" : i.getRequiredSkills().toLowerCase();
            long match = skills.stream().filter(s -> req.contains(s)).count();
            int parts = req.isEmpty() ? 1 : req.split(",").length;
            double score = skills.isEmpty() ? 0 : (match * 100.0 / parts);
            if (i.getLocation() != null && student.getLocation() != null && i.getLocation().equalsIgnoreCase(student.getLocation())) score += 10;
            score = Math.min(100, score);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("internship", i);
            m.put("matchScore", (int) Math.round(score));
            m.put("matchedSkills", match);
            scored.add(m);
        }
        scored.sort((a, b) -> Integer.compare((int) b.get("matchScore"), (int) a.get("matchScore")));
        return scored.stream().limit(10).collect(Collectors.toList());
    }
}
