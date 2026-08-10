package com.internlite.entity;

import com.internlite.enums.InterviewStatus;
import com.internlite.enums.InterviewType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long interviewId;

    @OneToOne
    private Application application;

    @Enumerated(EnumType.STRING)
    private InterviewType interviewType;

    private LocalDateTime scheduledAt;
    private String meetingLink;
    private String interviewerName;

    @Enumerated(EnumType.STRING)
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String feedback;
}
