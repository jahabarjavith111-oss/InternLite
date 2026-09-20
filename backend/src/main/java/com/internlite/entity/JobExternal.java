package com.internlite.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "jobs_external", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"source", "source_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobExternal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_name", nullable = false, length = 32)
    private String source; // openintern, greenhouse, lever, ashby, workable, smartrecruiters, recruitee, jobspipe

    @Column(name = "source_id", nullable = false, length = 128)
    private String sourceId;

    @Column(name = "source_url", length = 512)
    private String sourceUrl;

    @Column(name = "apply_url", nullable = false, length = 512)
    private String applyUrl;

    @Column(nullable = false, length = 256)
    private String title;

    @Column(name = "company_name", nullable = false, length = 256)
    private String companyName;

    @Column(name = "company_domain", length = 256)
    private String companyDomain;

    @Column(length = 512)
    private String location;

    @Column(length = 128)
    private String city;

    @Column(name = "state_code", length = 8)
    private String stateCode;

    @Column(name = "country_code", length = 8)
    private String countryCode;

    @Column(name = "is_remote")
    private Boolean isRemote = false;

    @Column(name = "workplace_type", length = 32)
    private String workplaceType; // remote, onsite, hybrid

    @Column(name = "description_md", columnDefinition = "TEXT")
    private String descriptionMd;

    @Column(name = "description_html", columnDefinition = "TEXT")
    private String descriptionHtml;

    @Column(name = "stipend_min")
    private Double stipendMin;

    @Column(name = "stipend_max")
    private Double stipendMax;

    @Column(name = "stipend_currency", length = 8)
    private String stipendCurrency = "USD";

    @Column(name = "employment_type", length = 32)
    private String employmentType; // intern, fulltime, parttime, contract

    @Column(columnDefinition = "TEXT")
    private String departments; // comma separated

    @Column(columnDefinition = "TEXT")
    private String tags; // comma separated skills/keywords

    @Column(name = "posted_at")
    private Instant postedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "source_raw", columnDefinition = "JSON")
    private String sourceRaw; // store original JSON as string

    @Column(name = "content_hash", length = 64)
    private String contentHash;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = Instant.now(); }
}
