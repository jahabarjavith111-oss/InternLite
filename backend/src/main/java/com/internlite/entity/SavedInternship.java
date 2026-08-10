package com.internlite.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_internships")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SavedInternship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long savedId;

    @ManyToOne
    private Student student;

    @ManyToOne
    private Internship internship;

    private LocalDateTime savedAt = LocalDateTime.now();
}
