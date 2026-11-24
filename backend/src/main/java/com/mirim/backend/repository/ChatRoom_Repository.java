package com.mirim.backend.repository;

import com.mirim.backend.Entity.ChatRoom;
import com.mirim.backend.Entity.MatchLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRoom_Repository extends JpaRepository<ChatRoom,Integer> {
    Optional<ChatRoom> findByMatchLogId(MatchLog matchLog);
}
