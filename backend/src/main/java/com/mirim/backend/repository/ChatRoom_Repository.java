package com.mirim.backend.repository;

import com.mirim.backend.Entity.ChatRoom;
import com.mirim.backend.Entity.MatchLog;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChatRoom_Repository extends JpaRepository<ChatRoom,Integer> {
    Optional<ChatRoom> findByMatchLogId(MatchLog matchLog);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from ChatRoom c where c.chatRoomId = :chatRoomId")
    Optional<ChatRoom> findByIdForUpdate(@Param("chatRoomId") int chatRoomId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from ChatRoom c where c.matchLogId = :matchLog")
    Optional<ChatRoom> findByMatchLogForUpdate(@Param("matchLog") MatchLog matchLog);
}
