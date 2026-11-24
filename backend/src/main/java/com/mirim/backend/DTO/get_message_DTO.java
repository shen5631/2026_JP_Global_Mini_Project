package com.mirim.backend.DTO;

import java.time.LocalDateTime;

public record get_message_DTO(
        int messageId,
        Integer senderAi,
        String senderNickname,
        String content,
        LocalDateTime sentTime
){}
