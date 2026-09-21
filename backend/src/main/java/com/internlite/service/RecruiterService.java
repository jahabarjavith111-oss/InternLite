package com.internlite.service;

import com.internlite.entity.*;
import com.internlite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class RecruiterService {

    private final RecruiterRepository recruiterRepo;
    private final CompanyRepository companyRepo;
    private final ApplicationRepository appRepo;
    private final InterviewRepository interviewRepo;
    private final InternshipRepository internshipRepo;

    public List<Internship> myInternships(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Recruiter r = recruiterRepo.findByUserUserId(user.getUserId()).orElseThrow();
        return r.getCompany().getInternships();
    }

    public List<Application> applicationsForInternship(Long internshipId) {
        Internship internship = internshipRepo.findById(internshipId)
            .orElseThrow(() -> new RuntimeException("Not found"));
        return appRepo.findByInternship(internship);
    }
}
