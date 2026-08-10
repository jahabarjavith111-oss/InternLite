package com.internlite.controller;

import com.internlite.entity.Notification;
import com.internlite.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin("*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getByUserId(userId));
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<Long> countUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.countUnread(userId));
    }
}
