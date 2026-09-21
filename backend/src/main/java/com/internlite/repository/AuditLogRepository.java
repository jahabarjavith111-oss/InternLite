package com.internlite.repository;

import com.internlite.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
}
