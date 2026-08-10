package com.internlite.service;

import com.internlite.entity.*;
import com.internlite.enums.NotificationType;
import com.internlite.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepo;

    public void notifyStudent(Student student, Application app, String msg) {
        Notification n = new Notification();
        n.setUser(student.getUser());
        n.setApplication(app);
        n.setMessage(msg);
        n.setType(NotificationType.APPLICATION);
        n.setIsRead(false);
        notificationRepo.save(n);
    }

    public List<Notification> getByUserId(Long userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long countUnread(Long userId) {
        return notificationRepo.countByUserIdAndIsReadFalse(userId);
    }
}
