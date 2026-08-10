package com.internlite.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Resume {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resumeId;

    @ManyToOne
    private Student student;

    private String resumeName;
    private String filePath;

    private boolean isDefault = false;

    private LocalDateTime uploadedAt = LocalDateTime.now();
}
