package com.mirim.backend.repository;

import com.mirim.backend.Entity.MatchLog;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatchLog_Repository extends JpaRepository<MatchLog,Integer> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from MatchLog m where m.matchLogId = :matchLogId")
    java.util.Optional<MatchLog> findByIdForUpdate(@Param("matchLogId") int matchLogId);

    @Query("select count(m) from MatchLog m " +
            "where m.status = com.mirim.backend.Entity.MatchLog.Status.ACTIVE " +
            "and exists (select c.chatRoomId from ChatRoom c " +
            "where c.matchLogId = m and c.chatRoomActive = true) " +
            "and (m.hostUser.userAi = :userAi or m.guestUser.userAi = :userAi)")
    long countActiveForUser(@Param("userAi") int userAi);

    // 내가 host 또는 guest로 참여한 매칭 목록
    @Query("select m from MatchLog m where m.hostUser.userAi = :userAi or m.guestUser.userAi = :userAi")
    Page<MatchLog> findByParticipant(@Param("userAi") int userAi, Pageable pageable);
}
