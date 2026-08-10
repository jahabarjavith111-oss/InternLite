package com.internlite.dto;

import com.internlite.enums.ApplicationStatus;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class StatusUpdate {
    private ApplicationStatus status;
    private String notes;
    private Long changedById;
}
