package com.mirim.backend.DTO;

import java.time.LocalDateTime;

public record get_match_DTO(
        int matchLogId,
        Integer chatRoomId,
        String categoryName,
        LocalDateTime matchLogTime,
        Partner partner
){
    public record Partner(
            Integer userAi,
            String userNickname,
            int userAge,
            String userCountry,
            boolean userLocal
    ){}
}
