package com.mirim.backend.repository;

import com.mirim.backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface User_Repository extends JpaRepository<User,Integer> {
}
