package com.mirim.backend.DTO;

public record sign_up_DTO(
     String userId,
     String userPw,
     String userName,
     String userNickname,
     Integer userAge,
     Boolean userLocal,
     String userCountry,
     String userGender,
     Integer categoryId
) {}
