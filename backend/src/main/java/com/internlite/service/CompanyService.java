package com.internlite.service;

import com.internlite.entity.*;
import com.internlite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepo;

    public Company create(Company company) {
        company.setCreatedAt(java.time.LocalDateTime.now());
        return companyRepo.save(company);
    }

    public Company update(Long id, Company details) {
        Company company = companyRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setCompanyName(details.getCompanyName());
        company.setDescription(details.getDescription());
        company.setIndustry(details.getIndustry());
        company.setWebsite(details.getWebsite());
        company.setLocation(details.getLocation());
        company.setLogo(details.getLogo());
        return companyRepo.save(company);
    }

    public List<Company> search(String name) {
        return name != null
            ? companyRepo.findByCompanyNameContainingIgnoreCase(name)
            : companyRepo.findAll();
    }

    public Company getById(Long id) {
        return companyRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
    }
}
