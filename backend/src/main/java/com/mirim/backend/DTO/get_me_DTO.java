package com.mirim.backend.DTO;

public record get_me_DTO(
        Integer userAi,
        String userId,
        String userName,
        String userNickname,
        int userAge,
        String userCountry,
        boolean userLocal,
        category_DTO category
){}
