package com.mirim.backend.controller;

import com.mirim.backend.DTO.post_board_DTO;
import com.mirim.backend.Entity.Board;
import com.mirim.backend.Entity.User;
import com.mirim.backend.service.Board_Service;
import com.mirim.backend.service.User_Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/boards")
public class Board_controller {

    private final Board_Service boardService;
    private final User_Service userService;

    public Board_controller(Board_Service boardService, User_Service userService) {
        this.boardService = boardService;
        this.userService = userService;
    }

    @GetMapping("")
    public ResponseEntity<?> get_boards(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        @RequestParam(required = false) Integer categoryId){
        return ResponseEntity.status(HttpStatus.OK).body(boardService.get_boards(categoryId, page, size));
    }

    @GetMapping("/{boardId}")
    public ResponseEntity<?> get_board(@PathVariable int boardId){
        return ResponseEntity.status(HttpStatus.OK).body(boardService.get_board(boardId));
    }

    @PostMapping("")
    public ResponseEntity<?> post_board(@RequestHeader(value = "Authorization", required = false) String token,
                                        @RequestBody post_board_DTO board){
        User user = userService.get_user(token);
        Board board1 = boardService.post_board(board, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("boardId",board1.getBoardId()));
    }

    @PutMapping("/{boardId}")
    public ResponseEntity<?> put_board(@RequestHeader(value = "Authorization", required = false) String token,
                                       @PathVariable int boardId,
                                       @RequestBody post_board_DTO board){
        User user = userService.get_user(token);
        boardService.put_board(boardId, board, user);
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message","수정 완료"));
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<?> delete_board(@RequestHeader(value = "Authorization", required = false) String token,
                                          @PathVariable int boardId){
        User user = userService.get_user(token);
        boardService.delete_board(boardId, user);
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message","삭제 완료"));
    }

    @PostMapping("/{boardId}/join")
    public ResponseEntity<?> join_board(@RequestHeader(value = "Authorization", required = false) String token,
                                        @PathVariable int boardId){
        User user = userService.get_user(token);
        return ResponseEntity.status(HttpStatus.CREATED).body(boardService.join_board(boardId, user));
    }
}
