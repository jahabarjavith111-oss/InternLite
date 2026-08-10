package com.internlite.repository;

import com.internlite.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    Optional<Skill> findBySkillNameIgnoreCase(String skillName);
    boolean existsBySkillNameIgnoreCase(String skillName);
}
