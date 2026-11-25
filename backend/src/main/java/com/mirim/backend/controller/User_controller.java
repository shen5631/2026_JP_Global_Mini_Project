package com.mirim.backend.controller;

import com.mirim.backend.DTO.patch_me_DTO;
import com.mirim.backend.DTO.sign_in_DTO;
import com.mirim.backend.DTO.sign_up_DTO;
import com.mirim.backend.Entity.User;
import com.mirim.backend.service.User_Service;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class User_controller {

    private final User_Service userService;

    public User_controller(User_Service userService){
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> sign_up(@RequestBody sign_up_DTO user){
        if(userService.createUser(user)){
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message","회원가입 성공"));
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message","이미 존재하는 아이디"));
    }

    @GetMapping("/check-id")
    public ResponseEntity<?> check_id(@RequestParam String userId){
        if(!userService.is_valid_id(userId)){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message","아이디 형식 오류"));
        }
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("available",userService.check_id(userId)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody sign_in_DTO login_data, HttpSession session){
        Optional<User> check = userService.sign_in(login_data);
        if(check.isEmpty()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","아이디 또는 비밀번호가 틀림"));
        }
        User user = check.get();
        session.setAttribute("userId", user.getUserId());   // 세션 발급 (JSESSIONID 쿠키)
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("accessToken",userService.issue_token(user),"userAi",user.getUserAi(),"userNickname",user.getUserNickname(),"userLocal",user.getUserLocal()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String token, HttpSession session){
        userService.get_user(token);
        userService.logout(token);   // 토큰 삭제
        session.invalidate();        // 세션 삭제
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message","로그아웃 성공"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String token){
        User user = userService.get_user(token);
        return ResponseEntity.status(HttpStatus.OK).body(userService.get_me(user));
    }

    @PatchMapping("/me")
    public ResponseEntity<?> patch_me(@RequestHeader(value = "Authorization", required = false) String token, @RequestBody patch_me_DTO dto){
        User user = userService.get_user(token);
        userService.patch_me(user, dto);
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message","수정 완료"));
    }

}