package com.mirim.backend.DTO;

import java.time.LocalDateTime;

public record get_board_DTO(
        int boardId,
        Integer userId,
        String nickname,
        String gender,
        int age,
        String userCountry,
        boolean userLocal,
        int categoryId,
        String categoryName,
        String title,
        String boardText,
        LocalDateTime boardTime
){}
