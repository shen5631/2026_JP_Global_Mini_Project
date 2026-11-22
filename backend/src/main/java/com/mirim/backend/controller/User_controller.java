package com.mirim.backend.controller;

import com.mirim.backend.DTO.sign_up_DTO;
import com.mirim.backend.Entity.User;
import com.mirim.backend.service.User_Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/users")
public class User_controller {

    private final User_Service userService;

    public User_controller(User_Service userService){
        this.userService = userService;
    }

    @PostMapping("/sign_up")
    public ResponseEntity<?> sign_up(@RequestBody sign_up_DTO user){
        userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("회원가입 성공");
    }

//    @PostMapping("/longin")
//    public ResponseEntity<?> login(@RequestBody User login_data){
//
//    }

}
