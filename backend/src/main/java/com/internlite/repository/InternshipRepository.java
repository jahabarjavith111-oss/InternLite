package com.internlite.repository;

import com.internlite.entity.Internship;
import com.internlite.enums.InternshipStatus;
import com.internlite.enums.WorkType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InternshipRepository extends JpaRepository<Internship, Long> {
    List<Internship> findByCompany_CompanyNameContainingIgnoreCase(String name);
    List<Internship> findByCategory_CategoryNameIgnoreCase(String category);
    List<Internship> findByLocationIgnoreCase(String location);
    List<Internship> findByWorkType(WorkType workType);
    List<Internship> findByStatus(InternshipStatus status);
    List<Internship> findByTitleContainingIgnoreCase(String title);
}
