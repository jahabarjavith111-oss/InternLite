package com.internlite.service;

import com.internlite.entity.AuditLog;
import com.internlite.entity.User;
import com.internlite.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {
    private final AuditLogRepository auditRepo;
    public void log(User user, String action, String entityType, Long entityId, String details) {
        AuditLog l = new AuditLog();
        l.setUser(user);
        l.setAction(action);
        l.setEntityType(entityType);
        l.setEntityId(entityId);
        l.setDetails(details);
        l.setCreatedAt(java.time.LocalDateTime.now());
        auditRepo.save(l);
    }
    public List<AuditLog> all() { return auditRepo.findAll(); }
}
