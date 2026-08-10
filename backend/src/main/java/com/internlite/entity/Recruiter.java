package com.internlite.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recruiters")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Recruiter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recruiterId;

    @OneToOne
    @MapsId
    private User user;

    private String designation;

    @ManyToOne
    private Company company;
}
