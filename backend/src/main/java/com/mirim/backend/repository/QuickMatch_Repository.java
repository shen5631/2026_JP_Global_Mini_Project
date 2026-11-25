package com.mirim.backend.repository;

import com.mirim.backend.Entity.QuickMatch;
import com.mirim.backend.Entity.MatchLog;
import com.mirim.backend.Entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuickMatch_Repository extends JpaRepository<QuickMatch,Integer> {

    // 사용자의 가장 최근 빠른 매칭 요청
    Optional<QuickMatch> findFirstByUserOrderByMatchIdDesc(User user);
    boolean existsByUserAndStatus(User user, QuickMatch.Status status);
    List<QuickMatch> findByMatchLog(MatchLog matchLog);

    // 대기 중인 상대 찾기: 현지인 <-> 여행자만, 오래 기다린 순
    // 카테고리가 같거나, 어느 한쪽이 '상관없음'이면 매칭
    @Query("select q from QuickMatch q " +
            "where q.status = com.mirim.backend.Entity.QuickMatch.Status.WAITING " +
            "and q.user.userLocal <> :local " +
            "and q.user.userAi <> :userAi " +
            "and (:anyCategory = true or q.category.categoryId = :categoryId or q.category.categoryName = :anyName) " +
            "order by q.matchId asc")
    List<QuickMatch> findPartners(@Param("local") boolean local, @Param("userAi") int userAi,
                                  @Param("categoryId") int categoryId, @Param("anyCategory") boolean anyCategory,
                                  @Param("anyName") String anyName, Pageable pageable);
}
