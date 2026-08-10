package com.internlite.repository;

import com.internlite.entity.Internship;
import com.internlite.entity.SavedInternship;
import com.internlite.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedInternshipRepository extends JpaRepository<SavedInternship, Long> {
    List<SavedInternship> findByStudent(Student student);
    boolean existsByStudentAndInternship(Student student, Internship internship);
}
