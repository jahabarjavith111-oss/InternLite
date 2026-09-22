package com.internlite.controller;

import com.internlite.entity.Interview;
import com.internlite.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/{appId}")
    public ResponseEntity<Interview> schedule(@PathVariable Long appId,
                                              @RequestBody Interview interview) {
        return ResponseEntity.ok(interviewService.schedule(appId, interview));
    }

    @GetMapping("/application/{appId}")
    public ResponseEntity<Interview> getByApplication(@PathVariable Long appId) {
        return interviewService.getByApplication(appId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Interview> updateStatus(@PathVariable Long id,
                                                  @RequestParam String status) {
        return ResponseEntity.ok(interviewService.updateStatus(id, status));
    }
}
