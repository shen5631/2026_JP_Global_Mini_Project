package com.mirim.backend.repository;

import com.mirim.backend.Entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface User_Repository extends JpaRepository<User,Integer> {
    Optional<User> findByUserId(String UserId);
    boolean existsByUserId(String UserId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.userAi = :userAi")
    Optional<User> findByIdForUpdate(@Param("userAi") Integer userAi);

}
