package com.mirim.backend.service;

import com.mirim.backend.DTO.get_notification_DTO;
import com.mirim.backend.Entity.Board;
import com.mirim.backend.Entity.MatchLog;
import com.mirim.backend.Entity.MatchNotification;
import com.mirim.backend.Entity.User;
import com.mirim.backend.repository.Board_Repository;
import com.mirim.backend.repository.MatchNotification_Repository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MatchNotification_Service {

    private final MatchNotification_Repository notificationRepository;
    private final Board_Repository boardRepository;

    public MatchNotification_Service(MatchNotification_Repository notificationRepository,
                                    Board_Repository boardRepository) {
        this.notificationRepository = notificationRepository;
        this.boardRepository = boardRepository;
    }

    public void notifyMatchCanceled(MatchLog matchLog, User recipient, User canceledBy) {
        MatchNotification notification = new MatchNotification();
        notification.setRecipient(recipient);
        notification.setMatchLog(matchLog);
        notification.setMessage(canceledBy.getUserNickname() + "님이 매칭을 취소했어요.");
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<get_notification_DTO> getUnread(User user) {
        return notificationRepository.findByRecipientAndReadFalseOrderByNotificationIdAsc(user)
                .stream()
                .map(notification -> {
                    MatchLog matchLog = notification.getMatchLog();
                    boolean host = matchLog.getHostUser().getUserAi().equals(user.getUserAi());
                    boolean boardDecisionRequired = host
                            && boardRepository.findByLockedByMatchLog(matchLog).stream()
                            .anyMatch(board -> board.getStatus() == Board.Status.CANCEL_PENDING);
                    return new get_notification_DTO(notification.getNotificationId(),
                            matchLog.getMatchLogId(), notification.getMessage(),
                            boardDecisionRequired, notification.getCreatedAt());
                })
                .toList();
    }

    @Transactional
    public void markRead(int notificationId, User user) {
        MatchNotification notification = notificationRepository
                .findByNotificationIdAndRecipient(notificationId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "알림을 찾을 수 없습니다"));
        notification.setRead(true);
    }
}
