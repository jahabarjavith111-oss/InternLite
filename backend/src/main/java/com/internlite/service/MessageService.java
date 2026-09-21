package com.internlite.service;

import com.internlite.entity.*;
import com.internlite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepo;
    private final UserRepository userRepo;
    private final ApplicationRepository appRepo;
    public Message send(Authentication auth, Long receiverId, Long applicationId, String content) {
        User principal = (User) auth.getPrincipal();
        User sender = userRepo.findById(principal.getUserId())
            .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepo.findById(receiverId).orElseThrow(() -> new RuntimeException("Receiver not found"));
        Message m = new Message();
        m.setSender(sender);
        m.setReceiver(receiver);
        if (applicationId != null) m.setApplication(appRepo.findById(applicationId).orElse(null));
        m.setContent(content);
        m.setRead(false);
        m.setCreatedAt(java.time.LocalDateTime.now());
        return messageRepo.save(m);
    }
    public List<Message> inbox(Authentication auth) {
        User user = (User) auth.getPrincipal();
        User managed = userRepo.findById(user.getUserId()).orElseThrow();
        return messageRepo.findByReceiverOrderByCreatedAtDesc(managed);
    }
    public List<Message> byApplication(Long applicationId) {
        return messageRepo.findByApplication_ApplicationIdOrderByCreatedAtAsc(applicationId);
    }
    public Message markRead(Long id) {
        Message m = messageRepo.findById(id).orElseThrow();
        m.setRead(true);
        return messageRepo.save(m);
    }
}
