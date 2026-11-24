package com.mirim.backend.controller;

import com.mirim.backend.DTO.translate_DTO;
import com.mirim.backend.service.Translation_Service;
import com.mirim.backend.service.User_Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/translations")
public class Translation_controller {

    private final Translation_Service translationService;
    private final User_Service userService;

    public Translation_controller(Translation_Service translationService, User_Service userService) {
        this.translationService = translationService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<?> translate(@RequestHeader(value = "Authorization", required = false) String token,
                                       @RequestBody translate_DTO request) {
        userService.get_user(token);
        return ResponseEntity.ok(translationService.translate(request));
    }
}
