package com.internlite.repository;

import com.internlite.entity.Message;
import com.internlite.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderAndReceiverOrderByCreatedAtAsc(User sender, User receiver);
    List<Message> findByReceiverOrderByCreatedAtDesc(User receiver);
    List<Message> findByApplication_ApplicationIdOrderByCreatedAtAsc(Long applicationId);
    long countByReceiverAndIsReadFalse(User receiver);
}
