package com.mirim.backend.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_room")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_room_id", nullable = false)
    private int chatRoomId;

    @JoinColumn(nullable = false, unique = true, name = "match_log_id")
    @OneToOne
    private MatchLog matchLogId;

    @Column(nullable = false, name = "chat_room_active")
    private boolean chatRoomActive = true;

    @CreationTimestamp
    @Column(nullable = false, name = "chat_room_create")
    private LocalDateTime chatRoomCreate;

    public ChatRoom() {
    }

    public int getChatRoomId() {
        return chatRoomId;
    }

    public void setChatRoomId(int chatRoomId) {
        this.chatRoomId = chatRoomId;
    }

    public MatchLog getMatchLogId() {
        return matchLogId;
    }

    public void setMatchLogId(MatchLog matchLogId) {
        this.matchLogId = matchLogId;
    }

    public boolean isChatRoomActive() {
        return chatRoomActive;
    }

    public void setChatRoomActive(boolean chatRoomActive) {
        this.chatRoomActive = chatRoomActive;
    }

    public LocalDateTime getChatRoomCreate() {
        return chatRoomCreate;
    }

    public void setChatRoomCreate(LocalDateTime chatRoomCreate) {
        this.chatRoomCreate = chatRoomCreate;
    }
}
