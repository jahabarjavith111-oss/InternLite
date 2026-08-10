package com.internlite.repository;

import com.internlite.entity.Resume;
import com.internlite.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByStudent(Student student);
    Resume findByStudentAndIsDefaultTrue(Student student);
}
