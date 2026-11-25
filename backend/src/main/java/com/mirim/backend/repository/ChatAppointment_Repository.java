package com.mirim.backend.repository;

import com.mirim.backend.Entity.ChatAppointment;
import com.mirim.backend.Entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatAppointment_Repository extends JpaRepository<ChatAppointment, Integer> {
    Optional<ChatAppointment> findByChatRoom(ChatRoom chatRoom);
}
