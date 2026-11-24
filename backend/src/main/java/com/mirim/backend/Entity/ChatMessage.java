package com.mirim.backend.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_message_id", nullable = false)
    private int messageId;

    @JoinColumn(nullable = false, name = "chat_room_id")
    @ManyToOne
    private ChatRoom chatRoom;

    @JoinColumn(nullable = false, name = "sender_user_id")
    @ManyToOne
    private User sender;

    @Column(nullable = false, name = "chat_message_content", columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(nullable = false, name = "chat_message_time")
    private LocalDateTime sentTime;

    public ChatMessage() {
    }

    public int getMessageId() {
        return messageId;
    }

    public void setMessageId(int messageId) {
        this.messageId = messageId;
    }

    public ChatRoom getChatRoom() {
        return chatRoom;
    }

    public void setChatRoom(ChatRoom chatRoom) {
        this.chatRoom = chatRoom;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getSentTime() {
        return sentTime;
    }

    public void setSentTime(LocalDateTime sentTime) {
        this.sentTime = sentTime;
    }
}
