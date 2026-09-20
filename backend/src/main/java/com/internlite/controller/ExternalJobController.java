package com.internlite.controller;

import com.internlite.dto.UnifiedJobDTO;
import com.internlite.entity.JobExternal;
import com.internlite.repository.JobExternalRepository;
import com.internlite.service.IngestionService;
import com.internlite.service.UnifiedJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin("*")
@RequiredArgsConstructor
public class ExternalJobController {

    private final JobExternalRepository jobExternalRepo;
    private final UnifiedJobService unifiedJobService;
    private final IngestionService ingestionService;

    @GetMapping("/api/external-jobs")
    public ResponseEntity<Page<JobExternal>> listExternal(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) Boolean isRemote,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<JobExternal> result = jobExternalRepo.searchExternal(
                emptyToNull(source), emptyToNull(employmentType), isRemote, emptyToNull(location), emptyToNull(keyword), pageable
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/jobs/unified")
    public ResponseEntity<Page<UnifiedJobDTO>> unifiedSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) Boolean isRemote,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String workType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UnifiedJobDTO> result = unifiedJobService.search(keyword, location, source, isRemote, employmentType, category, workType, pageable, false);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/internships/unified")
    public ResponseEntity<Page<UnifiedJobDTO>> unifiedInternships(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String workType,
            @RequestParam(required = false) Boolean isRemote,
            @RequestParam(required = false) String skill,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        // skill is treated as keyword extension for tags
        String kw = keyword;
        if (skill != null && !skill.isBlank()) kw = (kw == null ? "" : kw + " ") + skill;
        Pageable pageable = PageRequest.of(page, size);
        Page<UnifiedJobDTO> result = unifiedJobService.search(kw, location, source, isRemote, "intern", category, workType, pageable, true);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/external-jobs/{id}")
    public ResponseEntity<JobExternal> getExternalById(@PathVariable Long id) {
        return ResponseEntity.ok(jobExternalRepo.findById(id).orElseThrow(() -> new RuntimeException("External job not found")));
    }

    @PostMapping("/api/admin/jobs/ingest")
    public ResponseEntity<Map<String, Object>> triggerIngest(@RequestParam(required = false) String source) {
        IngestionService.IngestionResult result;
        if (source != null && !source.isBlank()) {
            result = ingestionService.ingestSource(source);
        } else {
            result = ingestionService.ingestAll();
        }
        return ResponseEntity.ok(Map.of(
                "totalFetched", result.totalFetched(),
                "inserted", result.inserted(),
                "updated", result.updated(),
                "skipped", result.skipped(),
                "errors", result.errors()
        ));
    }

    @GetMapping("/api/admin/jobs/ingest/stats")
    public ResponseEntity<Map<String, Object>> ingestStats() {
        return ResponseEntity.ok(Map.of(
                "totalExternal", jobExternalRepo.count(),
                "openintern", jobExternalRepo.countBySource("openintern"),
                "greenhouse", jobExternalRepo.countBySource("greenhouse"),
                "lever", jobExternalRepo.countBySource("lever"),
                "ashby", jobExternalRepo.countBySource("ashby"),
                "workable", jobExternalRepo.countBySource("workable"),
                "smartrecruiters", jobExternalRepo.countBySource("smartrecruiters"),
                "recruitee", jobExternalRepo.countBySource("recruitee")
        ));
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
