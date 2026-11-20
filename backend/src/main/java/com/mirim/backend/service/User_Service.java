package com.mirim.backend.service;

import com.mirim.backend.Entity.User;
import com.mirim.backend.repository.User_Repository;
import org.springframework.stereotype.Service;

@Service
public class User_Service {
    private User_Repository userRepository;

    public User_Service(User_Repository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user){
        return userRepository.save(user);
    }
}
