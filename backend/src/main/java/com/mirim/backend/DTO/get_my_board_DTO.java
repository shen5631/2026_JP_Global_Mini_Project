package com.mirim.backend.DTO;

import java.time.LocalDateTime;

public record get_my_board_DTO(
        int boardId,
        String userNickname,
        String categoryName,
        String title,
        String boardText,
        LocalDateTime boardTime,
        String status,
        Integer pendingMatchLogId
){}
