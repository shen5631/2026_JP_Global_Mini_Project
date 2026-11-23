package com.mirim.backend.DTO;

import java.time.LocalDateTime;

public record sign_up_DTO(
     String userId,
     String userPw,
     String userName,
     String userNickname,
     int userAge,
     boolean userLocal,
     String userCountry,
     String userGender,
     Integer categoryId
) {}
