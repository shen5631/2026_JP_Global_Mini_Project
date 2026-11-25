package com.mirim.backend.repository;

import com.mirim.backend.Entity.MatchNotification;
import com.mirim.backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchNotification_Repository extends JpaRepository<MatchNotification, Integer> {
    List<MatchNotification> findByRecipientAndReadFalseOrderByNotificationIdAsc(User recipient);
    Optional<MatchNotification> findByNotificationIdAndRecipient(Integer notificationId, User recipient);
}
