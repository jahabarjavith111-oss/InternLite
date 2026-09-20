package com.internlite.dto;

import lombok.*;

import java.time.Instant;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class UnifiedJobDTO {
    private String id; // prefixed: "ext-123" or "int-456"
    private String source; // internal, openintern, greenhouse, lever
    private String sourceId;
    private boolean isExternal;
    private String title;
    private String companyName;
    private String companyDomain;
    private String location;
    private Boolean isRemote;
    private String workplaceType;
    private String description;
    private String applyUrl;
    private String sourceUrl;
    private String employmentType;
    private Double stipendMin;
    private Double stipendMax;
    private String stipendCurrency;
    private String tags; // comma-separated required skills
    private String departments;
    private String duration;
    private Instant postedAt;
    private Instant createdAt;
}
