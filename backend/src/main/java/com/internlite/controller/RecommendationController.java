package com.internlite.controller;

import com.internlite.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin("*")
@RequiredArgsConstructor
public class RecommendationController {
    private final RecommendationService recService;
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> recommend(Authentication auth) { return ResponseEntity.ok(recService.recommend(auth)); }
}
