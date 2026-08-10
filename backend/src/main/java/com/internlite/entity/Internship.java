package com.internlite.entity;

import com.internlite.enums.InternshipStatus;
import com.internlite.enums.WorkType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "internships")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Internship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long internshipId;

    @ManyToOne
    private Company company;

    @ManyToOne
    private Category category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String location;

    @Enumerated(EnumType.STRING)
    private WorkType workType;

    private String duration;
    private Double stipend;
    private String requiredSkills;
    private LocalDate startDate;
    private LocalDate applicationDeadline;

    @Enumerated(EnumType.STRING)
    private InternshipStatus status = InternshipStatus.OPEN;

    private LocalDateTime createdAt = LocalDateTime.now();
}
