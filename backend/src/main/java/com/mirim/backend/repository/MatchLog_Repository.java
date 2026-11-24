package com.mirim.backend.repository;

import com.mirim.backend.Entity.Board;
import com.mirim.backend.Entity.MatchLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatchLog_Repository extends JpaRepository<MatchLog,Integer> {
    boolean existsByBoard(Board board);

    // 내가 host 또는 guest로 참여한 매칭 목록
    @Query("select m from MatchLog m where m.hostUser.userAi = :userAi or m.guestUser.userAi = :userAi")
    Page<MatchLog> findByParticipant(@Param("userAi") int userAi, Pageable pageable);
}
