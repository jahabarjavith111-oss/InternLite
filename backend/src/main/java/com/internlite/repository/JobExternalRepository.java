package com.internlite.repository;

import com.internlite.entity.JobExternal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface JobExternalRepository extends JpaRepository<JobExternal, Long> {
    Optional<JobExternal> findBySourceAndSourceId(String source, String sourceId);

    @Query(value = """
        SELECT * FROM jobs_external j
        WHERE (:source IS NULL OR j.source_name = :source)
          AND (:employmentType IS NULL OR j.employment_type = :employmentType)
          AND (:isRemote IS NULL OR j.is_remote = :isRemote)
          AND (:location IS NULL OR j.location LIKE CONCAT('%', :location, '%'))
          AND (:keyword IS NULL OR j.title LIKE CONCAT('%', :keyword, '%') OR j.description_md LIKE CONCAT('%', :keyword, '%') OR j.company_name LIKE CONCAT('%', :keyword, '%'))
          AND (:category IS NULL OR j.departments LIKE CONCAT('%', :category, '%') OR j.title LIKE CONCAT('%', :category, '%'))
          AND (:workType IS NULL OR j.workplace_type = :workType)
        ORDER BY j.posted_at DESC
        """,
            countQuery = """
        SELECT COUNT(*) FROM jobs_external j
        WHERE (:source IS NULL OR j.source_name = :source)
          AND (:employmentType IS NULL OR j.employment_type = :employmentType)
          AND (:isRemote IS NULL OR j.is_remote = :isRemote)
          AND (:location IS NULL OR j.location LIKE CONCAT('%', :location, '%'))
          AND (:keyword IS NULL OR j.title LIKE CONCAT('%', :keyword, '%') OR j.description_md LIKE CONCAT('%', :keyword, '%') OR j.company_name LIKE CONCAT('%', :keyword, '%'))
          AND (:category IS NULL OR j.departments LIKE CONCAT('%', :category, '%') OR j.title LIKE CONCAT('%', :category, '%'))
          AND (:workType IS NULL OR j.workplace_type = :workType)
        """, nativeQuery = true)
    Page<JobExternal> searchExternal(
            @Param("source") String source,
            @Param("employmentType") String employmentType,
            @Param("isRemote") Boolean isRemote,
            @Param("location") String location,
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("workType") String workType,
            Pageable pageable
    );

    default Page<JobExternal> searchExternal(String source, String employmentType, Boolean isRemote, String location, String keyword, Pageable pageable) {
        return searchExternal(source, employmentType, isRemote, location, keyword, null, null, pageable);
    }

    default Page<JobExternal> searchExternal(String source, Boolean isRemote, String location, String keyword, Pageable pageable) {
        return searchExternal(source, null, isRemote, location, keyword, null, null, pageable);
    }

    long countBySource(String source);
}
