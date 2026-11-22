package com.mirim.backend.controller;

import com.mirim.backend.DTO.check_id_DTO;
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
        userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message","회원가입 성공"));
    }

    @GetMapping("/check_id")
    public ResponseEntity<?> check_id(@RequestParam String userId){
        if(userService.check_id(userId)){
            return ResponseEntity.status(HttpStatus.OK).body(Map.of("available",true));
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body("아이디 중복 오류");
    }

//    @PostMapping("/longin")
//    public ResponseEntity<?> login(@RequestBody User login_data){
//
//    }

}
