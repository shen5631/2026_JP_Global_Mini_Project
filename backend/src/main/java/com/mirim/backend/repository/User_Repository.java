package com.mirim.backend.repository;

import com.mirim.backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface User_Repository extends JpaRepository<User,Integer> {
    Optional<User> findByUserId(String UserId);
    boolean existsByUserId(String UserId);
}
