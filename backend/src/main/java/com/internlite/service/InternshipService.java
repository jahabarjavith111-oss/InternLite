package com.internlite.service;

import com.internlite.entity.*;
import com.internlite.enums.InternshipStatus;
import com.internlite.enums.WorkType;
import com.internlite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.*;

@Service
@RequiredArgsConstructor
public class InternshipService {

    private final InternshipRepository internshipRepo;
    private final CategoryRepository categoryRepo;
    private final CompanyRepository companyRepo;

    public List<Internship> search(String keyword, String location,
                                   String category, String workType) {
        List<Internship> internships = internshipRepo.findByStatus(InternshipStatus.OPEN);
        if (keyword != null && !keyword.isBlank()) {
            String kw = keyword.toLowerCase();
            internships = internships.stream()
                .filter(i -> haystack(i).contains(kw))
                .collect(Collectors.toList());
        }
        if (location != null && !location.isBlank()) {
            String loc = location.toLowerCase();
            internships = internships.stream()
                .filter(i -> i.getLocation() != null && i.getLocation().toLowerCase().contains(loc))
                .collect(Collectors.toList());
        }
        if (category != null && !category.isBlank()) internships = internships.stream()
            .filter(i -> i.getCategory() != null && i.getCategory().getCategoryName().equalsIgnoreCase(category))
            .collect(Collectors.toList());
        if (workType != null && !workType.isBlank()) {
            try {
                WorkType wt = WorkType.valueOf(workType.toUpperCase().replace("-", "").replace(" ", ""));
                internships = internships.stream()
                    .filter(i -> i.getWorkType() == wt)
                    .collect(Collectors.toList());
            } catch (IllegalArgumentException ignored) { /* unknown work type: no filter */ }
        }
        return internships;
    }

    private String haystack(Internship i) {
        StringBuilder sb = new StringBuilder();
        if (i.getTitle() != null) sb.append(i.getTitle()).append(' ');
        if (i.getDescription() != null) sb.append(i.getDescription()).append(' ');
        if (i.getRequiredSkills() != null) sb.append(i.getRequiredSkills()).append(' ');
        if (i.getCompany() != null && i.getCompany().getCompanyName() != null)
            sb.append(i.getCompany().getCompanyName()).append(' ');
        if (i.getCategory() != null && i.getCategory().getCategoryName() != null)
            sb.append(i.getCategory().getCategoryName()).append(' ');
        return sb.toString().toLowerCase();
    }

    public Internship getById(Long id) {
        return internshipRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
    }

    public Internship create(Internship internship, Long companyId) {
        Company company = companyRepo.findById(companyId).orElseThrow();
        internship.setCompany(company);
        internship.setCreatedAt(java.time.LocalDateTime.now());
        internship.setStatus(InternshipStatus.OPEN);
        return internshipRepo.save(internship);
    }
}
