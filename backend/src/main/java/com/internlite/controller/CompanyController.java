package com.internlite.controller;

import java.util.List;

import com.internlite.entity.Company;
import com.internlite.service.CompanyService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<List<Company>> search(
            @RequestParam(required = false) String name) {

        return ResponseEntity.ok(companyService.search(name));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getById(@PathVariable Long id) {

        return ResponseEntity.ok(companyService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Company> create(@RequestBody Company company,
                                          Authentication auth) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(companyService.createForRecruiter(company, auth));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> update(
            @PathVariable Long id,
            @RequestBody Company company,
            Authentication auth) {

        return ResponseEntity.ok(companyService.updateAndLink(id, company, auth));
    }
}
