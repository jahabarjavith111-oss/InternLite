package com.internlite.repository;

import com.internlite.entity.Skill;
import com.internlite.entity.Student;
import com.internlite.entity.StudentSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentSkillRepository extends JpaRepository<StudentSkill, Long> {
    List<StudentSkill> findByStudent(Student student);
    List<StudentSkill> findBySkill(Skill skill);
    void deleteByStudentAndSkill(Student student, Skill skill);
}
