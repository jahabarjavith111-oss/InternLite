package com.internlite.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class JobApplicationRequest {
    private Long jobId;
    private Long resumeId;
    private String coverLetter;
}
