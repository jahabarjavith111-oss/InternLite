package com.internlite.service;

import com.internlite.dto.UnifiedJobDTO;
import com.internlite.entity.Internship;
import com.internlite.entity.Job;
import com.internlite.entity.JobExternal;
import com.internlite.ingestion.CanonicalJob;
import com.internlite.ingestion.SourceAdapter;
import com.internlite.repository.InternshipRepository;
import com.internlite.repository.JobExternalRepository;
import com.internlite.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class UnifiedJobService {

    private final JobRepository jobRepo;
    private final JobExternalRepository jobExternalRepo;
    private final InternshipRepository internshipRepo;
    private final JobService jobService;
    private final InternshipService internshipService;
    // Live adapters for ?live=true fetches (optional — page never breaks if a board is down).
    private final List<SourceAdapter> adapters;

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
        return search(keyword, location, source, isRemote, employmentType, category, workType, pageable, internshipsOnly, false);
    }

    public Page<UnifiedJobDTO> search(String keyword, String location, String source, Boolean isRemote, String employmentType, String category, String workType, Pageable pageable, boolean internshipsOnly, boolean live) {
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
            // Live mode: hit the board API directly and merge fresh roles on top.
            // Never breaks the page — any board failure just falls back to cache.
            if (live && extSource != null) {
                all = mergeLive(extSource, keyword, location, isRemote, internshipsOnly, all);
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

    /**
     * Live fetch: query the source's public board API right now and merge fresh
     * roles ahead of cached rows. Dedupes on (source, sourceId); applies the
     * same keyword/location/remote/intern filters as the cached path.
     */
    private List<UnifiedJobDTO> mergeLive(String extSource, String keyword, String location, Boolean isRemote, boolean internshipsOnly, List<UnifiedJobDTO> cached) {
        SourceAdapter adapter = null;
        if (adapters != null) {
            for (SourceAdapter a : adapters) {
                if (a.getSource().equalsIgnoreCase(extSource)) { adapter = a; break; }
            }
        }
        if (adapter == null) return cached;
        List<CanonicalJob> fresh;
        try {
            fresh = adapter.fetch();
        } catch (Exception e) {
            log.warn("[{}] live fetch failed, serving cache: {}", extSource, e.getMessage());
            return cached;
        }
        if (fresh == null || fresh.isEmpty()) return cached;
        String kw = keyword == null ? null : keyword.trim().toLowerCase();
        String loc = location == null ? null : location.trim().toLowerCase();
        java.util.Set<String> seen = cached.stream()
                .map(d -> d.getSource() + "|" + d.getSourceId())
                .collect(java.util.stream.Collectors.toSet());
        List<UnifiedJobDTO> merged = new ArrayList<>();
        for (CanonicalJob cj : fresh) {
            try {
                if (internshipsOnly && !"intern".equalsIgnoreCase(cj.getEmploymentType())) continue;
                if (Boolean.TRUE.equals(isRemote) && !Boolean.TRUE.equals(cj.getIsRemote())) continue;
                if (kw != null && !kw.isEmpty()) {
                    String hay = ((cj.getTitle() == null ? "" : cj.getTitle()) + " "
                            + (cj.getCompanyName() == null ? "" : cj.getCompanyName()) + " "
                            + (cj.getDescriptionMd() == null ? "" : cj.getDescriptionMd())).toLowerCase();
                    if (!hay.contains(kw)) continue;
                }
                if (loc != null && !loc.isEmpty()) {
                    String jl = cj.getLocation() == null ? "" : cj.getLocation().toLowerCase();
                    if (!jl.contains(loc)) continue;
                }
                String key = cj.getSource() + "|" + cj.getSourceId();
                if (seen.contains(key)) continue;
                seen.add(key);
                merged.add(toDTO(cj));
            } catch (Exception e) {
                log.warn("[{}] live row skipped: {}", extSource, e.getMessage());
            }
        }
        log.info("[{}] live merge: +{} fresh roles", extSource, merged.size());
        merged.addAll(cached);
        return merged;
    }

    private UnifiedJobDTO toDTO(CanonicalJob cj) {
        return UnifiedJobDTO.builder()
                .id("live-" + cj.getSource() + "-" + cj.getSourceId())
                .source(cj.getSource())
                .sourceId(cj.getSourceId())
                .isExternal(true)
                .title(cj.getTitle())
                .companyName(cj.getCompanyName())
                .companyDomain(cj.getCompanyDomain())
                .location(cj.getLocation())
                .isRemote(cj.getIsRemote())
                .workplaceType(cj.getWorkplaceType())
                .description(cj.getDescriptionMd())
                .applyUrl(cj.getApplyUrl())
                .sourceUrl(cj.getSourceUrl())
                .employmentType(cj.getEmploymentType())
                .stipendMin(cj.getStipendMin())
                .stipendMax(cj.getStipendMax())
                .stipendCurrency(cj.getStipendCurrency())
                .tags(cj.getTags())
                .departments(cj.getDepartments())
                .duration(null)
                .postedAt(cj.getPostedAt())
                .createdAt(cj.getPostedAt())
                .build();
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
