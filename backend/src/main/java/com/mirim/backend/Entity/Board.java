package com.mirim.backend.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "board")
public class Board {

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

    @Column(nullable = false, name = "board_head", length = 100)
    private String boardHead;

    @Column(nullable = true, name = "board_text")
    private String boardText;

    public Board() {
    }

    public String getBoardHead() {
        return boardHead;
    }

    public void setBoardHead(String boardHead) {
        this.boardHead = boardHead;
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
}
