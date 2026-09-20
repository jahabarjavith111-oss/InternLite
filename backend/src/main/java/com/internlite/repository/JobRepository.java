package com.internlite.repository;

import com.internlite.entity.Job;
import com.internlite.entity.Student;
import com.internlite.enums.InternshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatus(InternshipStatus status);
    List<Job> findByStatusOrderByCreatedAtDesc(InternshipStatus status);
}
