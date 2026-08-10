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
        if (keyword != null) internships = internships.stream()
            .filter(i -> i.getTitle().toLowerCase().contains(keyword.toLowerCase()))
            .collect(Collectors.toList());
        if (location != null) internships = internships.stream()
            .filter(i -> i.getLocation() != null && i.getLocation().equalsIgnoreCase(location))
            .collect(Collectors.toList());
        if (category != null) internships = internships.stream()
            .filter(i -> i.getCategory() != null && i.getCategory().getCategoryName().equalsIgnoreCase(category))
            .collect(Collectors.toList());
        if (workType != null) internships = internships.stream()
            .filter(i -> i.getWorkType() == WorkType.valueOf(workType.toUpperCase()))
            .collect(Collectors.toList());
        return internships;
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
