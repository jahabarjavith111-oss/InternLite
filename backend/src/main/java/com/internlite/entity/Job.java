package com.internlite.entity;

import com.internlite.enums.InternshipStatus;
import com.internlite.enums.WorkType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long jobId;

    @ManyToOne
    @JsonIgnoreProperties("internships")
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

    /** FULL_TIME, PART_TIME, CONTRACT */
    private String employmentType = "FULL_TIME";

    private Double salary;
    private String requiredSkills;
    private String experience;
    private LocalDate applicationDeadline;

    @Enumerated(EnumType.STRING)
    private InternshipStatus status = InternshipStatus.OPEN;

    private LocalDateTime createdAt = LocalDateTime.now();
}
