package com.mirim.backend.DTO;

import java.time.LocalDateTime;

public record get_match_list_DTO(
        int matchLogId,
        String categoryName,
        String partnerNickname,
        LocalDateTime matchLogTime,
        String status
){}
