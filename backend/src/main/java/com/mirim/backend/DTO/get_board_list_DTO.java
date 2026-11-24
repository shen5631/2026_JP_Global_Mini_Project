package com.mirim.backend.DTO;

import java.time.LocalDateTime;

public record get_board_list_DTO(
        int boardId,
        String userNickname,
        String categoryName,
        String boardText,
        LocalDateTime boardTime
){}
