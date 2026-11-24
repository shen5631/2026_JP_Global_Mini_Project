package com.mirim.backend.repository;

import com.mirim.backend.Entity.ChatMessage;
import com.mirim.backend.Entity.ChatRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessage_Repository extends JpaRepository<ChatMessage,Integer> {
    Page<ChatMessage> findByChatRoom(ChatRoom chatRoom, Pageable pageable);
}
