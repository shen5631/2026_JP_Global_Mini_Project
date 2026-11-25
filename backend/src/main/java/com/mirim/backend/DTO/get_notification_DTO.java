package com.mirim.backend.DTO;

import java.time.LocalDateTime;

public record get_notification_DTO(
        int notificationId,
        int matchLogId,
        String message,
        boolean boardDecisionRequired,
        LocalDateTime createdAt
){}
