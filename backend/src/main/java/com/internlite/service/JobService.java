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
public class JobService {
    private final JobRepository jobRepo;
    private final CategoryRepository categoryRepo;
    private final CompanyRepository companyRepo;
    private final RecruiterRepository recruiterRepo;

    public List<Job> search(String keyword, String location, String category, String workType) {
        List<Job> jobs = jobRepo.findByStatusOrderByCreatedAtDesc(InternshipStatus.OPEN);
        if (keyword != null && !keyword.isBlank()) jobs = jobs.stream()
            .filter(j -> (j.getTitle() != null && j.getTitle().toLowerCase().contains(keyword.toLowerCase()))
                || (j.getDescription() != null && j.getDescription().toLowerCase().contains(keyword.toLowerCase())))
            .collect(Collectors.toList());
        if (location != null && !location.isBlank()) jobs = jobs.stream()
            .filter(j -> j.getLocation() != null && j.getLocation().toLowerCase().contains(location.toLowerCase()))
            .collect(Collectors.toList());
        if (category != null && !category.isBlank()) jobs = jobs.stream()
            .filter(j -> j.getCategory() != null && j.getCategory().getCategoryName().equalsIgnoreCase(category))
            .collect(Collectors.toList());
        if (workType != null && !workType.isBlank()) jobs = jobs.stream()
            .filter(j -> j.getWorkType() != null && j.getWorkType().name().equalsIgnoreCase(workType))
            .collect(Collectors.toList());
        return jobs;
    }

    public Job getById(Long id) {
        return jobRepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public Job create(Job job, Authentication auth) {
        User user = (User) auth.getPrincipal();
        Company company = null;
        try {
            var rec = recruiterRepo.findByUserUserId(user.getUserId()).orElse(null);
            if (rec != null && rec.getCompany() != null) company = rec.getCompany();
        } catch (Exception ignored) {}
        if (company == null && job.getCompany() != null && job.getCompany().getCompanyId() != null) {
            company = companyRepo.findById(job.getCompany().getCompanyId()).orElse(null);
        }
        if (company == null) {
            List<Company> all = companyRepo.findAll();
            if (!all.isEmpty()) company = all.get(0);
            else {
                Company c = new Company();
                c.setCompanyName("Default Company");
                c.setCreatedAt(java.time.LocalDateTime.now());
                company = companyRepo.save(c);
            }
        }
        job.setCompany(company);
        if (job.getCategory() != null && job.getCategory().getCategoryId() != null) {
            categoryRepo.findById(job.getCategory().getCategoryId()).ifPresent(job::setCategory);
        }
        job.setCreatedAt(java.time.LocalDateTime.now());
        if (job.getStatus() == null) job.setStatus(InternshipStatus.OPEN);
        if (job.getEmploymentType() == null) job.setEmploymentType("FULL_TIME");
        return jobRepo.save(job);
    }

    public Job updateStatus(Long id, InternshipStatus status) {
        Job j = getById(id);
        j.setStatus(status);
        return jobRepo.save(j);
    }

    public List<Job> myJobs(Authentication auth) {
        User user = (User) auth.getPrincipal();
        var rec = recruiterRepo.findByUserUserId(user.getUserId()).orElse(null);
        if (rec == null || rec.getCompany() == null) return Collections.emptyList();
        Long cid = rec.getCompany().getCompanyId();
        return jobRepo.findAll().stream()
            .filter(j -> j.getCompany() != null && cid.equals(j.getCompany().getCompanyId()))
            .collect(Collectors.toList());
    }
}
