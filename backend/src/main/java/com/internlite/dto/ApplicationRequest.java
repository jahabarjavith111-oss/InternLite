package com.internlite.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ApplicationRequest {
    @NotNull
    private Long internshipId;
    private Long resumeId;
    private String coverLetter;
}
