package com.internlite.controller;

import com.internlite.entity.Message;
import com.internlite.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;
    @GetMapping("/inbox")
    public ResponseEntity<List<Message>> inbox(Authentication auth) { return ResponseEntity.ok(messageService.inbox(auth)); }
    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<Message>> byApplication(@PathVariable Long applicationId) { return ResponseEntity.ok(messageService.byApplication(applicationId)); }
    @PostMapping
    public ResponseEntity<Message> send(Authentication auth, @RequestBody Map<String, Object> body) {
        Long receiverId = Long.valueOf(body.get("receiverId").toString());
        Long appId = body.get("applicationId") == null ? null : Long.valueOf(body.get("applicationId").toString());
        String content = (String) body.get("content");
        return ResponseEntity.ok(messageService.send(auth, receiverId, appId, content));
    }
    @PutMapping("/{id}/read")
    public ResponseEntity<Message> markRead(@PathVariable Long id) { return ResponseEntity.ok(messageService.markRead(id)); }
}
