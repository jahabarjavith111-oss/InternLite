package com.internlite.service;

import com.internlite.entity.JobExternal;
import com.internlite.ingestion.CanonicalJob;
import com.internlite.ingestion.SourceAdapter;
import com.internlite.repository.JobExternalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngestionService {

    private final JobExternalRepository jobExternalRepo;
    private final List<SourceAdapter> adapters;

    public IngestionResult ingestAll() {
        int totalFetched = 0;
        int inserted = 0;
        int updated = 0;
        int skipped = 0;
        int errors = 0;

        for (SourceAdapter adapter : adapters) {
            String source = adapter.getSource();
            try {
                List<CanonicalJob> jobs = adapter.fetch();
                totalFetched += jobs.size();
                for (CanonicalJob cj : jobs) {
                    try {
                        Optional<JobExternal> existingOpt = jobExternalRepo.findBySourceAndSourceId(source, cj.getSourceId());
                        if (existingOpt.isPresent()) {
                            JobExternal existing = existingOpt.get();
                            if (cj.getContentHash() != null && cj.getContentHash().equals(existing.getContentHash())) {
                                skipped++;
                                continue;
                            }
                            // update
                            mapToEntity(cj, existing);
                            jobExternalRepo.save(existing);
                            updated++;
                        } else {
                            JobExternal entity = new JobExternal();
                            mapToEntity(cj, entity);
                            jobExternalRepo.save(entity);
                            inserted++;
                        }
                    } catch (Exception e) {
                        log.warn("[{}] upsert failed for {}: {}", source, cj.getSourceId(), e.getMessage());
                        errors++;
                    }
                }
                log.info("[{}] Ingestion done: fetched={}, inserted={}, updated={}, skipped={}, errors={}", source, jobs.size(), inserted, updated, skipped, errors);
            } catch (Exception e) {
                log.error("[{}] Adapter failed: {}", source, e.getMessage(), e);
                errors++;
            }
        }
        return new IngestionResult(totalFetched, inserted, updated, skipped, errors);
    }

    public IngestionResult ingestSource(String source) {
        for (SourceAdapter adapter : adapters) {
            if (adapter.getSource().equalsIgnoreCase(source)) {
                try {
                    List<CanonicalJob> jobs = adapter.fetch();
                    int inserted = 0, updated = 0, skipped = 0;
                    for (CanonicalJob cj : jobs) {
                        Optional<JobExternal> existingOpt = jobExternalRepo.findBySourceAndSourceId(source, cj.getSourceId());
                        if (existingOpt.isPresent()) {
                            JobExternal existing = existingOpt.get();
                            if (cj.getContentHash() != null && cj.getContentHash().equals(existing.getContentHash())) { skipped++; continue; }
                            mapToEntity(cj, existing);
                            jobExternalRepo.save(existing);
                            updated++;
                        } else {
                            JobExternal entity = new JobExternal();
                            mapToEntity(cj, entity);
                            jobExternalRepo.save(entity);
                            inserted++;
                        }
                    }
                    return new IngestionResult(jobs.size(), inserted, updated, skipped, 0);
                } catch (Exception e) {
                    throw new RuntimeException("Ingestion failed for " + source + ": " + e.getMessage(), e);
                }
            }
        }
        throw new IllegalArgumentException("Unknown source: " + source);
    }

    private void mapToEntity(CanonicalJob cj, JobExternal e) {
        e.setSource(cj.getSource());
        e.setSourceId(cj.getSourceId());
        e.setSourceUrl(cj.getSourceUrl());
        e.setApplyUrl(cj.getApplyUrl());
        e.setTitle(cj.getTitle());
        e.setCompanyName(cj.getCompanyName());
        e.setCompanyDomain(cj.getCompanyDomain());
        e.setLocation(cj.getLocation());
        e.setCity(cj.getCity());
        e.setStateCode(cj.getStateCode());
        e.setCountryCode(cj.getCountryCode());
        e.setIsRemote(cj.getIsRemote() != null ? cj.getIsRemote() : false);
        e.setWorkplaceType(cj.getWorkplaceType());
        e.setDescriptionMd(cj.getDescriptionMd());
        e.setDescriptionHtml(cj.getDescriptionHtml());
        e.setStipendMin(cj.getStipendMin());
        e.setStipendMax(cj.getStipendMax());
        e.setStipendCurrency(cj.getStipendCurrency());
        e.setEmploymentType(cj.getEmploymentType());
        e.setDepartments(cj.getDepartments());
        e.setTags(cj.getTags());
        e.setPostedAt(cj.getPostedAt());
        e.setExpiresAt(cj.getExpiresAt());
        e.setSourceRaw(cj.getSourceRaw());
        e.setContentHash(cj.getContentHash());
    }

    public record IngestionResult(int totalFetched, int inserted, int updated, int skipped, int errors) {}
}
