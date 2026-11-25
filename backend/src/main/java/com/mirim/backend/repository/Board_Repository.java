package com.mirim.backend.repository;

import com.mirim.backend.Entity.Board;
import com.mirim.backend.Entity.MatchLog;
import com.mirim.backend.Entity.User;
import com.mirim.backend.Entity.QuickMatch;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface Board_Repository extends JpaRepository<Board,Integer> {

    // 공개 중인 모집글만 조회. 재공개 후에도 과거 매칭 이력은 유지한다.
    @Query("select b from Board b " +
            "where (:categoryId is null or b.categoryId.categoryId = :categoryId) " +
            "and b.status = com.mirim.backend.Entity.Board.Status.OPEN")
    Page<Board> findOpenBoards(@Param("categoryId") Integer categoryId, Pageable pageable);

    // 참여 신청 시 동시에 여러 명이 눌러도 한 명만 확정되도록 행을 잠그고 조회
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Board b where b.boardId = :boardId")
    Optional<Board> findByIdForUpdate(@Param("boardId") int boardId);

    @Query("select b from Board b where b.userId.userAi = :userAi order by b.board_time desc")
    List<Board> findByWriter(@Param("userAi") Integer userAi);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Board b where b.userId.userAi = :userAi " +
            "and b.status = com.mirim.backend.Entity.Board.Status.OPEN order by b.boardId")
    List<Board> findOpenByWriterForUpdate(@Param("userAi") Integer userAi);

    List<Board> findByLockedByMatchLog(MatchLog matchLog);
    List<Board> findByLockedByQuickMatch(QuickMatch quickMatch);
    boolean existsByUserIdAndStatus(User user, Board.Status status);
}
