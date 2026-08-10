package com.internlite.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "students")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentId;

    @OneToOne
    @MapsId
    private User user;

    private String college;
    private String degree;
    private String branch;
    private Integer graduationYear;
    private String location;
    @Column(columnDefinition = "TEXT")
    private String bio;
}
