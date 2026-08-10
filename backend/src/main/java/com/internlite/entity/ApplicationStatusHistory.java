package com.internlite.entity;

import com.internlite.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "application_status_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ApplicationStatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    @ManyToOne
    private Application application;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    @ManyToOne
    private User changedBy;

    private String notes;
    private LocalDateTime changedAt = LocalDateTime.now();
}
