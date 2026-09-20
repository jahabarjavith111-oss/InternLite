package com.internlite.ingestion;

import lombok.*;
import java.time.Instant;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CanonicalJob {
    private String source;
    private String sourceId;
    private String sourceUrl;
    private String applyUrl;
    private String title;
    private String companyName;
    private String companyDomain;
    private String location;
    private String city;
    private String stateCode;
    private String countryCode;
    private Boolean isRemote;
    private String workplaceType;
    private String descriptionMd;
    private String descriptionHtml;
    private Double stipendMin;
    private Double stipendMax;
    private String stipendCurrency;
    private String employmentType;
    private String departments;
    private String tags;
    private Instant postedAt;
    private Instant expiresAt;
    private String sourceRaw; // JSON string
    private String contentHash;
}
