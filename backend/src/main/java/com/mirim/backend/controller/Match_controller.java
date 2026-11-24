package com.mirim.backend.controller;

import com.mirim.backend.DTO.quick_match_DTO;
import com.mirim.backend.Entity.User;
import com.mirim.backend.service.Match_Service;
import com.mirim.backend.service.User_Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class Match_controller {

    private final Match_Service matchService;
    private final User_Service userService;

    public Match_controller(Match_Service matchService, User_Service userService) {
        this.matchService = matchService;
        this.userService = userService;
    }

    @GetMapping("/categories")
    public ResponseEntity<?> get_categories(){
        return ResponseEntity.status(HttpStatus.OK).body(matchService.get_categories());
    }

    @PostMapping("/matches/quick")
    public ResponseEntity<?> request_quick(@RequestHeader(value = "Authorization", required = false) String token,
                                           @RequestBody quick_match_DTO body){
        User user = userService.get_user(token);
        return ResponseEntity.status(HttpStatus.OK).body(matchService.request_quick(body.categoryId(), user));
    }

    @GetMapping("/matches/quick/status")
    public ResponseEntity<?> get_quick_status(@RequestHeader(value = "Authorization", required = false) String token){
        User user = userService.get_user(token);
        return ResponseEntity.status(HttpStatus.OK).body(matchService.get_quick_status(user));
    }

    @DeleteMapping("/matches/quick")
    public ResponseEntity<?> cancel_quick(@RequestHeader(value = "Authorization", required = false) String token){
        User user = userService.get_user(token);
        matchService.cancel_quick(user);
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message","매칭 취소"));
    }

    @GetMapping("/matches/me")
    public ResponseEntity<?> get_my_matches(@RequestHeader(value = "Authorization", required = false) String token,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size){
        User user = userService.get_user(token);
        return ResponseEntity.status(HttpStatus.OK).body(matchService.get_my_matches(user, page, size));
    }

    @GetMapping("/matches/{matchLogId}")
    public ResponseEntity<?> get_match(@RequestHeader(value = "Authorization", required = false) String token,
                                       @PathVariable int matchLogId){
        User user = userService.get_user(token);
        return ResponseEntity.status(HttpStatus.OK).body(matchService.get_match(matchLogId, user));
    }
}
