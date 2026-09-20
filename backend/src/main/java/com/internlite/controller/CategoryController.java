package com.internlite.controller;

import com.internlite.entity.Category;
import com.internlite.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin("*")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;
    @GetMapping
    public ResponseEntity<List<Category>> all() { return ResponseEntity.ok(categoryService.all()); }
    @PostMapping
    public ResponseEntity<Category> create(@RequestBody Category c) { return ResponseEntity.ok(categoryService.create(c)); }
}
