package com.mirim.backend.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "match_log")
public class MatchLog {

    public enum Status { ACTIVE, CANCELED, COMPLETED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "match_log_id", nullable = false)
    private int matchLogId;

    // 모집글로 매칭된 경우에만 값이 있음 (빠른 매칭은 null)
    @JoinColumn(name = "board_id")
    @ManyToOne
    private Board board;

    // 모집글 작성자
    @JoinColumn(nullable = false, name = "host_user_id")
    @ManyToOne
    private User hostUser;

    // 참여 신청한 사용자
    @JoinColumn(nullable = false, name = "guest_user_id")
    @ManyToOne
    private User guestUser;

    @JoinColumn(nullable = false, name = "category_id")
    @ManyToOne
    private Category categoryId;

    @CreationTimestamp
    @Column(nullable = false, name = "match_log_time")
    private LocalDateTime matchLogTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "match_status", length = 20)
    private Status status = Status.ACTIVE;

    @ManyToOne
    @JoinColumn(name = "canceled_by_user_id")
    private User canceledBy;

    @Column(name = "canceled_at")
    private LocalDateTime canceledAt;

    public MatchLog() {
    }

    public int getMatchLogId() {
        return matchLogId;
    }

    public void setMatchLogId(int matchLogId) {
        this.matchLogId = matchLogId;
    }

    public Board getBoard() {
        return board;
    }

    public void setBoard(Board board) {
        this.board = board;
    }

    public User getHostUser() {
        return hostUser;
    }

    public void setHostUser(User hostUser) {
        this.hostUser = hostUser;
    }

    public User getGuestUser() {
        return guestUser;
    }

    public void setGuestUser(User guestUser) {
        this.guestUser = guestUser;
    }

    public Category getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Category categoryId) {
        this.categoryId = categoryId;
    }

    public LocalDateTime getMatchLogTime() {
        return matchLogTime;
    }

    public void setMatchLogTime(LocalDateTime matchLogTime) {
        this.matchLogTime = matchLogTime;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public User getCanceledBy() {
        return canceledBy;
    }

    public void setCanceledBy(User canceledBy) {
        this.canceledBy = canceledBy;
    }

    public LocalDateTime getCanceledAt() {
        return canceledAt;
    }

    public void setCanceledAt(LocalDateTime canceledAt) {
        this.canceledAt = canceledAt;
    }
}
