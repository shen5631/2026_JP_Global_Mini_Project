package com.mirim.backend.Entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_appointment")
public class ChatAppointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id", nullable = false)
    private Integer appointmentId;

    @OneToOne
    @JoinColumn(name = "chat_room_id", nullable = false, unique = true)
    private ChatRoom chatRoom;

    @Column(name = "appointment_place", nullable = false, length = 50)
    private String place;

    @Column(name = "appointment_at", nullable = false)
    private LocalDateTime appointmentAt;

    public Integer getAppointmentId() {
        return appointmentId;
    }

    public ChatRoom getChatRoom() {
        return chatRoom;
    }

    public void setChatRoom(ChatRoom chatRoom) {
        this.chatRoom = chatRoom;
    }

    public String getPlace() {
        return place;
    }

    public void setPlace(String place) {
        this.place = place;
    }

    public LocalDateTime getAppointmentAt() {
        return appointmentAt;
    }

    public void setAppointmentAt(LocalDateTime appointmentAt) {
        this.appointmentAt = appointmentAt;
    }
}
