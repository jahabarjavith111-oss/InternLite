package com.internlite.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @ManyToOne
    private User user;

    private String action;
    private String entityType;
    private Long entityId;
    private String details;
    private LocalDateTime createdAt = LocalDateTime.now();
}
