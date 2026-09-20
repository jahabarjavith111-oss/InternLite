package com.internlite.repository;

import com.internlite.entity.Job;
import com.internlite.entity.JobApplication;
import com.internlite.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByStudent(Student student);
    List<JobApplication> findByJob(Job job);
    boolean existsByJobAndStudent(Job job, Student student);
}
