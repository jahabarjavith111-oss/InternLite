package com.internlite.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledIngestion {

    private final IngestionService ingestionService;

    // Every 4 hours for high-priority sources (OpenIntern, Greenhouse, Lever)
    @Scheduled(fixedDelay = 4 * 60 * 60 * 1000, initialDelay = 30_000)
    public void scheduledIngest() {
        log.info("Scheduled ingestion starting...");
        try {
            var result = ingestionService.ingestAll();
            log.info("Scheduled ingestion completed: {}", result);
        } catch (Exception e) {
            log.error("Scheduled ingestion failed", e);
        }
    }
}
