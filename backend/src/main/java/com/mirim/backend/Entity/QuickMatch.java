package com.mirim.backend.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

// 빠른 매칭 대기열 (match 테이블, match는 MySQL 예약어라 백틱 필수)
@Entity
@Table(name = "`match`")
public class QuickMatch {

    public enum Status { WAITING, MATCHED, CANCELED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "match_id", nullable = false)
    private int matchId;

    @JoinColumn(nullable = false, name = "user_id")
    @ManyToOne
    private User user;

    @JoinColumn(name = "category_id")
    @ManyToOne
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_status", length = 10)
    private Status status = Status.WAITING;

    // 매칭이 확정되면 채워짐
    @JoinColumn(name = "match_log_id")
    @ManyToOne
    private MatchLog matchLog;

    @CreationTimestamp
    @Column(name = "match_time")
    private LocalDateTime matchTime;

    public QuickMatch() {
    }

    public int getMatchId() {
        return matchId;
    }

    public void setMatchId(int matchId) {
        this.matchId = matchId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public MatchLog getMatchLog() {
        return matchLog;
    }

    public void setMatchLog(MatchLog matchLog) {
        this.matchLog = matchLog;
    }

    public LocalDateTime getMatchTime() {
        return matchTime;
    }

    public void setMatchTime(LocalDateTime matchTime) {
        this.matchTime = matchTime;
    }
}
