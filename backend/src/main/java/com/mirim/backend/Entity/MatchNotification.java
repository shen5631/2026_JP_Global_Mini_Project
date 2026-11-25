package com.mirim.backend.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "match_notification")
public class MatchNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id", nullable = false)
    private Integer notificationId;

    @ManyToOne
    @JoinColumn(name = "recipient_user_id", nullable = false)
    private User recipient;

    @ManyToOne
    @JoinColumn(name = "match_log_id", nullable = false)
    private MatchLog matchLog;

    @Column(name = "notification_message", nullable = false, length = 200)
    private String message;

    @Column(name = "notification_read", nullable = false)
    private boolean read;

    @CreationTimestamp
    @Column(name = "notification_created", nullable = false)
    private LocalDateTime createdAt;

    public Integer getNotificationId() {
        return notificationId;
    }

    public User getRecipient() {
        return recipient;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public MatchLog getMatchLog() {
        return matchLog;
    }

    public void setMatchLog(MatchLog matchLog) {
        this.matchLog = matchLog;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
