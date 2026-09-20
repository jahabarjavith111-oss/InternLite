package com.internlite.service;

import com.internlite.dto.UnifiedJobDTO;
import com.internlite.entity.Internship;
import com.internlite.entity.Job;
import com.internlite.entity.JobExternal;
import com.internlite.repository.InternshipRepository;
import com.internlite.repository.JobExternalRepository;
import com.internlite.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UnifiedJobService {

    private final JobRepository jobRepo;
    private final JobExternalRepository jobExternalRepo;
    private final InternshipRepository internshipRepo;
    private final JobService jobService;
    private final InternshipService internshipService;

    public Page<UnifiedJobDTO> search(String keyword, String location, String source, Boolean isRemote, String employmentType, Pageable pageable) {
        // overload for backward compat
        return search(keyword, location, source, isRemote, employmentType, pageable, false);
    }

    public Page<UnifiedJobDTO> search(String keyword, String location, String source, Boolean isRemote, Pageable pageable) {
        return search(keyword, location, source, isRemote, null, pageable, false);
    }

    public Page<UnifiedJobDTO> search(String keyword, String location, String source, Boolean isRemote, String employmentType, Pageable pageable, boolean internshipsOnly) {
        return search(keyword, location, source, isRemote, employmentType, null, null, pageable, internshipsOnly);
    }

    public Page<UnifiedJobDTO> search(String keyword, String location, String source, Boolean isRemote, String employmentType, String category, String workType, Pageable pageable, boolean internshipsOnly) {
        List<UnifiedJobDTO> all = new ArrayList<>();

        // External jobs - always include unless source == internal
        boolean includeExternal = source == null || !"internal".equalsIgnoreCase(source);
        boolean includeInternal = source == null || "internal".equalsIgnoreCase(source) || "all".equalsIgnoreCase(source);

        String empType = emptyToNull(employmentType);
        String cat = emptyToNull(category);
        String wt = emptyToNull(workType) != null ? workType.toLowerCase() : null;
        if (includeExternal) {
            String extSource = null;
            if (source != null && !"all".equalsIgnoreCase(source) && !"internal".equalsIgnoreCase(source)) {
                extSource = source.toLowerCase();
            }
            // fetch all matching external (we paginate manually after merge)
            // To avoid loading millions, we fetch with large pageable then merge
            Page<JobExternal> externalPage = jobExternalRepo.searchExternal(
                    extSource, empType, isRemote, emptyToNull(location), emptyToNull(keyword), cat, wt,
                    PageRequest.of(0, 5000, Sort.by(Sort.Direction.DESC, "posted_at"))
            );
            for (JobExternal je : externalPage.getContent()) {
                all.add(toDTO(je));
            }
        }

        if (includeInternal) {
            String effectiveWorkType = wt != null ? wt.toUpperCase() : (isRemote != null && isRemote ? "REMOTE" : null);
            if (internshipsOnly) {
                // Internal internships
                List<Internship> internalInternships = internshipService.search(keyword, location, emptyToNull(category), effectiveWorkType);
                for (Internship ins : internalInternships) {
                    // category already handled by service; extra client check for departments/tags not needed
                    all.add(toDTO(ins));
                }
            } else {
                // Internal jobs via existing service
                List<Job> internalJobs = jobService.search(
                        keyword, location, emptyToNull(category), effectiveWorkType
                );
                // If source is explicitly external, skip internal
                if (includeInternal && (source == null || "internal".equalsIgnoreCase(source) || "all".equalsIgnoreCase(source))) {
                    for (Job j : internalJobs) {
                        all.add(toDTO(j));
                    }
                }
            }
        }

        // Sort by postedAt/createdAt DESC
        all.sort(Comparator.comparing((UnifiedJobDTO d) -> d.getPostedAt() != null ? d.getPostedAt() : d.getCreatedAt() != null ? d.getCreatedAt() : java.time.Instant.EPOCH).reversed());

        // Manual pagination after merge
        int total = all.size();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), total);
        List<UnifiedJobDTO> pageContent = start >= total ? List.of() : all.subList(start, end);

        return new PageImpl<>(pageContent, pageable, total);
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private UnifiedJobDTO toDTO(JobExternal je) {
        return UnifiedJobDTO.builder()
                .id("ext-" + je.getId())
                .source(je.getSource())
                .sourceId(je.getSourceId())
                .isExternal(true)
                .title(je.getTitle())
                .companyName(je.getCompanyName())
                .companyDomain(je.getCompanyDomain())
                .location(je.getLocation())
                .isRemote(je.getIsRemote())
                .workplaceType(je.getWorkplaceType())
                .description(je.getDescriptionMd())
                .applyUrl(je.getApplyUrl())
                .sourceUrl(je.getSourceUrl())
                .employmentType(je.getEmploymentType())
                .stipendMin(je.getStipendMin())
                .stipendMax(je.getStipendMax())
                .stipendCurrency(je.getStipendCurrency())
                .tags(je.getTags())
                .departments(je.getDepartments())
                .duration(null)
                .postedAt(je.getPostedAt())
                .createdAt(je.getCreatedAt())
                .build();
    }

    private UnifiedJobDTO toDTO(Job j) {
        return UnifiedJobDTO.builder()
                .id("int-" + j.getJobId())
                .source("internal")
                .sourceId(String.valueOf(j.getJobId()))
                .isExternal(false)
                .title(j.getTitle())
                .companyName(j.getCompany() != null ? j.getCompany().getCompanyName() : "InternLite")
                .location(j.getLocation())
                .isRemote(j.getWorkType() != null && "REMOTE".equalsIgnoreCase(j.getWorkType().name()))
                .workplaceType(j.getWorkType() != null ? j.getWorkType().name().toLowerCase() : null)
                .description(j.getDescription())
                .applyUrl("/jobs/" + j.getJobId())
                .sourceUrl("/jobs/" + j.getJobId())
                .employmentType(j.getEmploymentType())
                .stipendMin(j.getSalary())
                .stipendMax(j.getSalary())
                .tags(j.getRequiredSkills())
                .departments(j.getCategory() != null ? j.getCategory().getCategoryName() : null)
                .duration(null)
                .postedAt(j.getCreatedAt() != null ? j.getCreatedAt().toInstant(java.time.ZoneOffset.UTC) : null)
                .createdAt(j.getCreatedAt() != null ? j.getCreatedAt().toInstant(java.time.ZoneOffset.UTC) : null)
                .build();
    }

    private UnifiedJobDTO toDTO(Internship ins) {
        return UnifiedJobDTO.builder()
                .id("int-" + ins.getInternshipId())
                .source("internal")
                .sourceId(String.valueOf(ins.getInternshipId()))
                .isExternal(false)
                .title(ins.getTitle())
                .companyName(ins.getCompany() != null ? ins.getCompany().getCompanyName() : "InternLite")
                .location(ins.getLocation())
                .isRemote(ins.getWorkType() != null && "REMOTE".equalsIgnoreCase(ins.getWorkType().name()))
                .workplaceType(ins.getWorkType() != null ? ins.getWorkType().name().toLowerCase() : null)
                .description(ins.getDescription())
                .applyUrl("/internships/" + ins.getInternshipId())
                .sourceUrl("/internships/" + ins.getInternshipId())
                .employmentType("intern")
                .stipendMin(ins.getStipend())
                .stipendMax(ins.getStipend())
                .tags(ins.getRequiredSkills())
                .departments(ins.getCategory() != null ? ins.getCategory().getCategoryName() : null)
                .duration(ins.getDuration())
                .postedAt(ins.getCreatedAt() != null ? ins.getCreatedAt().toInstant(java.time.ZoneOffset.UTC) : null)
                .createdAt(ins.getCreatedAt() != null ? ins.getCreatedAt().toInstant(java.time.ZoneOffset.UTC) : null)
                .build();
    }
}
