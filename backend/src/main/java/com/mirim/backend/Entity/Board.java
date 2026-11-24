package com.mirim.backend.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "board")
public class Board {

    public enum Status { OPEN, QUICK_WAITING, MATCHED, CANCEL_PENDING, CLOSED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_id", nullable = false)
    private int boardId;


    @JoinColumn(nullable = false, name = "user_id")
    @ManyToOne
    private User userId;

    @JoinColumn(nullable = false, name = "category_id")
    @ManyToOne
    private Category categoryId;

    @Column(nullable = false, name = "board_time")
    @CreationTimestamp
    private LocalDateTime board_time;

    @Column(nullable = true, name = "board_text")
    private String boardText;

    @Column(nullable = false, name = "board_head", length = 100)
    private String boardHead;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "board_status", length = 20)
    private Status status = Status.OPEN;

    @ManyToOne
    @JoinColumn(name = "locked_by_match_log_id")
    private MatchLog lockedByMatchLog;

    @ManyToOne
    @JoinColumn(name = "locked_by_quick_match_id")
    private QuickMatch lockedByQuickMatch;

    public Board() {
    }

    public int getBoardId() {
        return boardId;
    }

    public void setBoardId(int boardId) {
        this.boardId = boardId;
    }

    public User getUserId() {
        return userId;
    }

    public void setUserId(User userId) {
        this.userId = userId;
    }

    public Category getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Category categoryId) {
        this.categoryId = categoryId;
    }

    public LocalDateTime getBoard_time() {
        return board_time;
    }

    public void setBoard_time(LocalDateTime board_time) {
        this.board_time = board_time;
    }

    public String getBoardText() {
        return boardText;
    }

    public void setBoardText(String boardText) {
        this.boardText = boardText;
    }

    public String getBoardHead() {
        return boardHead;
    }

    public void setBoardHead(String boardHead) {
        this.boardHead = boardHead;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public MatchLog getLockedByMatchLog() {
        return lockedByMatchLog;
    }

    public void setLockedByMatchLog(MatchLog lockedByMatchLog) {
        this.lockedByMatchLog = lockedByMatchLog;
    }

    public QuickMatch getLockedByQuickMatch() {
        return lockedByQuickMatch;
    }

    public void setLockedByQuickMatch(QuickMatch lockedByQuickMatch) {
        this.lockedByQuickMatch = lockedByQuickMatch;
    }
}
