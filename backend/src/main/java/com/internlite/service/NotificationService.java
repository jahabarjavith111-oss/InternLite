package com.internlite.service;

import com.internlite.entity.*;
import com.internlite.enums.NotificationType;
import com.internlite.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepo;

    // Notify a student
    public void notifyStudent(Student student, Application app, String msg) {

        Notification n = new Notification();

        n.setUser(student.getUser());
        n.setApplication(app);
        n.setMessage(msg);
        n.setType(NotificationType.APPLICATION);
        n.setIsRead(false);

        notificationRepo.save(n);
    }

    // General notification method
    public void notifyUser(
            User user,
            Application app,
            String msg,
            NotificationType type) {

        Notification n = new Notification();

        n.setUser(user);
        n.setApplication(app);
        n.setMessage(msg);
        n.setType(type);
        n.setIsRead(false);

        notificationRepo.save(n);
    }

    // Get notifications for a user
    public List<Notification> getByUserId(Long userId) {

        return notificationRepo.findByUser_UserIdOrderByCreatedAtDesc(userId);
    }

    // Count unread notifications
    public long countUnread(Long userId) {

        return notificationRepo.countByUser_UserIdAndIsReadFalse(userId);
    }
}