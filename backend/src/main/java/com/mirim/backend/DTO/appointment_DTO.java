package com.mirim.backend.DTO;

import java.time.LocalDateTime;

public record appointment_DTO(
        String place,
        LocalDateTime at
){}
