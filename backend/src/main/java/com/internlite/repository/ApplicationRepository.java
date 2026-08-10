package com.internlite.repository;

import com.internlite.entity.Application;
import com.internlite.entity.Internship;
import com.internlite.entity.Student;
import com.internlite.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudent(Student student);
    List<Application> findByInternship(Internship internship);
    List<Application> findByInternshipAndStatus(Internship internship, ApplicationStatus status);
    List<Application> findByStudentAndStatus(Student student, ApplicationStatus status);
    boolean existsByInternshipAndStudent(Internship internship, Student student);
}
