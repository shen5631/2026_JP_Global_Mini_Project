package com.mirim.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

// 서비스에서 던진 ResponseStatusException을 {"message": "..."} 형태로 응답
@RestControllerAdvice
public class Exception_handler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> handle_status(ResponseStatusException e){
        String message = e.getReason() == null ? "" : e.getReason();
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", message));
    }
}
