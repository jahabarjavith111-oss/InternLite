package com.internlite.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_skills")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class StudentSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentSkillId;

    @ManyToOne
    private Student student;

    @ManyToOne
    private Skill skill;
}
