package com.mirim.backend.controller;

import com.mirim.backend.DTO.send_message_DTO;
import com.mirim.backend.Entity.User;
import com.mirim.backend.service.Chat_Service;
import com.mirim.backend.service.User_Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chats")
public class Chat_controller {

    private final Chat_Service chatService;
    private final User_Service userService;

    public Chat_controller(Chat_Service chatService, User_Service userService) {
        this.chatService = chatService;
        this.userService = userService;
    }

    @GetMapping("/{chatRoomId}/messages")
    public ResponseEntity<?> get_messages(@RequestHeader(value = "Authorization", required = false) String token,
                                          @PathVariable int chatRoomId,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "50") int size){
        User user = userService.get_user(token);
        return ResponseEntity.status(HttpStatus.OK).body(chatService.get_messages(chatRoomId, page, size, user));
    }

    @PostMapping("/{chatRoomId}/message")
    public ResponseEntity<?> send_message(@RequestHeader(value = "Authorization", required = false) String token,
                                          @PathVariable int chatRoomId,
                                          @RequestBody send_message_DTO body){
        User user = userService.get_user(token);
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.send_message(chatRoomId, body.content(), user));
    }
}
