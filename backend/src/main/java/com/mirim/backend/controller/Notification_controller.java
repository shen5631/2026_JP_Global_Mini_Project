package com.mirim.backend.controller;

import com.mirim.backend.Entity.User;
import com.mirim.backend.service.MatchNotification_Service;
import com.mirim.backend.service.User_Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class Notification_controller {

    private final MatchNotification_Service notificationService;
    private final User_Service userService;

    public Notification_controller(MatchNotification_Service notificationService, User_Service userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> get_unread(@RequestHeader(value = "Authorization", required = false) String token){
        User user = userService.get_user(token);
        return ResponseEntity.status(HttpStatus.OK).body(notificationService.getUnread(user));
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<?> mark_read(@RequestHeader(value = "Authorization", required = false) String token,
                                       @PathVariable int notificationId){
        User user = userService.get_user(token);
        notificationService.markRead(notificationId, user);
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message", "알림 확인 완료"));
    }
}
