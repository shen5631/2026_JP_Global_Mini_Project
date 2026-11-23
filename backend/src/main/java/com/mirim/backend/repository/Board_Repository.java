package com.mirim.backend.repository;

import com.mirim.backend.Entity.Board;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface Board_Repository extends JpaRepository<Board,Integer> {

    // 아직 매칭되지 않은(모집 중인) 게시글만 조회, categoryId가 null이면 전체 카테고리
    @Query("select b from Board b " +
            "where (:categoryId is null or b.categoryId.categoryId = :categoryId) " +
            "and not exists (select m.matchLogId from MatchLog m where m.board = b)")
    Page<Board> findOpenBoards(@Param("categoryId") Integer categoryId, Pageable pageable);

    // 참여 신청 시 동시에 여러 명이 눌러도 한 명만 확정되도록 행을 잠그고 조회
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Board b where b.boardId = :boardId")
    Optional<Board> findByIdForUpdate(@Param("boardId") int boardId);
}
