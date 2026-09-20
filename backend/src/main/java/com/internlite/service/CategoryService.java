package com.internlite.service;

import com.internlite.entity.Category;
import com.internlite.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepo;
    public List<Category> all() { return categoryRepo.findAll(); }
    public Category create(Category c) {
        categoryRepo.findByCategoryNameIgnoreCase(c.getCategoryName()).ifPresent(e -> { throw new RuntimeException("Category exists"); });
        return categoryRepo.save(c);
    }
}
