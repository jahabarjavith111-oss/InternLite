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
    private final UserRepository userRepo;

    /** Find-or-create so freshly registered recruiters work immediately. */
    public Recruiter getOrCreateRecruiter(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return recruiterRepo.findByUserUserId(user.getUserId()).orElseGet(() -> {
            Recruiter r = new Recruiter();
            r.setUser(userRepo.findById(user.getUserId()).orElseThrow());
            return recruiterRepo.save(r);
        });
    }

    public List<Internship> myInternships(Authentication auth) {
        Recruiter r = getOrCreateRecruiter(auth);
        if (r.getCompany() == null) return List.of();
        List<Internship> list = r.getCompany().getInternships();
        return list == null ? List.of() : list;
    }

    public Company myCompany(Authentication auth) {
        return getOrCreateRecruiter(auth).getCompany();
    }

    public Map<String, Object> stats(Authentication auth) {
        List<Internship> internships = myInternships(auth);
        List<Application> all = new ArrayList<>();
        for (Internship i : internships) all.addAll(appRepo.findByInternship(i));
        long shortlisted = all.stream().filter(a ->
            a.getStatus() == com.internlite.enums.ApplicationStatus.SHORTLISTED
                || a.getStatus() == com.internlite.enums.ApplicationStatus.INTERVIEW).count();
        long interviews = all.stream().filter(a ->
            a.getStatus() == com.internlite.enums.ApplicationStatus.INTERVIEW).count();
        long active = internships.stream().filter(i ->
            i.getStatus() == com.internlite.enums.InternshipStatus.OPEN).count();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("activeInternships", active);
        m.put("totalApplicants", all.size());
        m.put("shortlisted", shortlisted);
        m.put("interviews", interviews);
        return m;
    }

    public Internship postInternship(Authentication auth, Internship internship) {
        Recruiter r = getOrCreateRecruiter(auth);
        if (r.getCompany() == null) {
            throw new RuntimeException("Create your company profile first");
        }
        internship.setCompany(r.getCompany());
        internship.setCreatedAt(java.time.LocalDateTime.now());
        internship.setStatus(com.internlite.enums.InternshipStatus.OPEN);
        return internshipRepo.save(internship);
    }

    public Internship updateInternship(Authentication auth, Long id, Internship data) {
        Recruiter r = getOrCreateRecruiter(auth);
        Internship internship = internshipRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Internship not found"));
        if (r.getCompany() == null || internship.getCompany() == null
                || !internship.getCompany().getCompanyId().equals(r.getCompany().getCompanyId())) {
            throw new RuntimeException("Not your internship");
        }
        internship.setTitle(data.getTitle());
        internship.setDescription(data.getDescription());
        internship.setLocation(data.getLocation());
        internship.setWorkType(data.getWorkType());
        internship.setDuration(data.getDuration());
        internship.setStipend(data.getStipend());
        internship.setRequiredSkills(data.getRequiredSkills());
        internship.setStartDate(data.getStartDate());
        internship.setApplicationDeadline(data.getApplicationDeadline());
        if (data.getCategory() != null) internship.setCategory(data.getCategory());
        return internshipRepo.save(internship);
    }

    public Internship updateInternshipStatus(Authentication auth, Long id, String status) {
        Recruiter r = getOrCreateRecruiter(auth);
        Internship internship = internshipRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Internship not found"));
        if (r.getCompany() == null || internship.getCompany() == null
                || !internship.getCompany().getCompanyId().equals(r.getCompany().getCompanyId())) {
            throw new RuntimeException("Not your internship");
        }
        internship.setStatus(com.internlite.enums.InternshipStatus.valueOf(status.toUpperCase()));
        return internshipRepo.save(internship);
    }

    public List<Application> applicationsForInternship(Long internshipId) {
        Internship internship = internshipRepo.findById(internshipId)
            .orElseThrow(() -> new RuntimeException("Not found"));
        return appRepo.findByInternship(internship);
    }
}
