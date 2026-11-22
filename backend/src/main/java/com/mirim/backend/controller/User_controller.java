package com.mirim.backend.controller;

import com.mirim.backend.DTO.sign_in_DTO;
import com.mirim.backend.DTO.sign_up_DTO;
import com.mirim.backend.Entity.User;
import com.mirim.backend.service.User_Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class User_controller {

    private final User_Service userService;

    public User_controller(User_Service userService){
        this.userService = userService;
    }

    @PostMapping("/sign_up")
    public ResponseEntity<?> sign_up(@RequestBody sign_up_DTO user){
        if(userService.createUser(user)){
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message","회원가입 성공"));
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body("아이디 오류");
    }

    @GetMapping("/check_id")
    public ResponseEntity<?> check_id(@RequestParam String userId){
        if(userService.check_id(userId)){
            return ResponseEntity.status(HttpStatus.OK).body(Map.of("available",true));
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body("아이디 중복 오류");
    }

    @PostMapping("/longin")
    public ResponseEntity<?> login(@RequestBody sign_in_DTO login_data){
        if(userService.sign_in(login_data).isEmpty()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("회원가입 실패");
        }
        User user = userService.sign_in(login_data).get();
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("accessToken","임시","userAi",user.getUserAi(),"userNickname",user.getUserNickname(),"userLocal",user.getUserLocal()));
    }

}
