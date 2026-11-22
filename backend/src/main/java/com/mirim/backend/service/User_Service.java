package com.mirim.backend.service;

import com.mirim.backend.DTO.patch_me_DTO;
import com.mirim.backend.DTO.sign_in_DTO;
import com.mirim.backend.DTO.sign_up_DTO;
import com.mirim.backend.Entity.User;
import com.mirim.backend.repository.User_Repository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Service
public class User_Service {
    private final User_Repository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User_Service(User_Repository userRepository, PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    public boolean createUser(sign_up_DTO user){
        if(userRepository.existsByUserId(user.userId())){
            return false;
        }
        User user1 = new User();
        user1.setUserId(user.userId());
        user1.setUserPw(passwordEncoder.encode(user.userPw()));
        user1.setUserName(user.userName());
        user1.setUserNickname(user.userNickname());
        user1.setUserAge(user.userAge());
        user1.setUserLocal(user.userLocal());
        user1.setUserGender(user.userGender());
        user1.setUserCountry(user.userCountry());
        user1.setCategoryId(user.categoryId());

        userRepository.save(user1);
        return true;
    }

    public boolean check_id(String user_id){
        return userRepository.findByUserId(user_id).isEmpty();
    }

    public Optional<User> sign_in(sign_in_DTO user){
        return userRepository.findByUserId(user.userId()).filter(u -> passwordEncoder.matches(user.userPw(), u.getUserPw()));
    }

//    public boolean patch_me(patch_me_DTO user){
//
//    }

}
