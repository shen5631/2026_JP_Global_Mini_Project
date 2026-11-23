package com.mirim.backend.service;

import com.mirim.backend.DTO.get_board_DTO;
import com.mirim.backend.DTO.get_board_list_DTO;
import com.mirim.backend.DTO.post_board_DTO;
import com.mirim.backend.Entity.Board;
import com.mirim.backend.Entity.Category;
import com.mirim.backend.Entity.ChatRoom;
import com.mirim.backend.Entity.MatchLog;
import com.mirim.backend.Entity.User;
import com.mirim.backend.repository.Board_Repository;
import com.mirim.backend.repository.Category_Repository;
import com.mirim.backend.repository.ChatRoom_Repository;
import com.mirim.backend.repository.MatchLog_Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class Board_Service {

    private final Board_Repository boardRepository;
    private final Category_Repository categoryRepository;
    private final MatchLog_Repository matchLogRepository;
    private final ChatRoom_Repository chatRoomRepository;

    public Board_Service(Board_Repository boardRepository, Category_Repository categoryRepository,
                         MatchLog_Repository matchLogRepository, ChatRoom_Repository chatRoomRepository) {
        this.boardRepository = boardRepository;
        this.categoryRepository = categoryRepository;
        this.matchLogRepository = matchLogRepository;
        this.chatRoomRepository = chatRoomRepository;
    }

    public Map<String, Object> get_boards(Integer categoryId, int page, int size){
        if(page < 0 || size < 1 || size > 100){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 파라미터");
        }
        Page<Board> result = boardRepository.findOpenBoards(categoryId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "boardId")));
        List<get_board_list_DTO> boards = result.getContent().stream()
                .map(b -> new get_board_list_DTO(b.getBoardId(), b.getUserId().getUserNickname(),
                        b.getCategoryId().getCategoryName(), b.getBoardText(), b.getBoard_time()))
                .toList();
        return Map.of("boards", boards, "totalPages", result.getTotalPages(), "currentPage", result.getNumber());
    }

    public get_board_DTO get_board(int boardId){
        Board board = find_board(boardId);
        User writer = board.getUserId();
        Category category = board.getCategoryId();
        return new get_board_DTO(board.getBoardId(), writer.getUserAi(), writer.getUserNickname(), writer.getUserCountry(),
                writer.getUserLocal(), category.getCategoryId(), category.getCategoryName(), board.getBoardText(), board.getBoard_time());
    }

    public Board post_board(post_board_DTO board, User user){
        check_board_input(board);
        Board board1 = new Board();
        board1.setUserId(user);
        board1.setCategoryId(find_category(board.categoryId()));
        board1.setBoardText(board.boardText());

        return boardRepository.save(board1);
    }

    public void put_board(int boardId, post_board_DTO board, User user){
        check_board_input(board);
        Board board1 = find_board(boardId);
        check_writer(board1, user);
        board1.setCategoryId(find_category(board.categoryId()));
        board1.setBoardText(board.boardText());
        boardRepository.save(board1);
    }

    public void delete_board(int boardId, User user){
        Board board = find_board(boardId);
        check_writer(board, user);
        if(matchLogRepository.existsByBoard(board)){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "매칭된 게시글은 삭제할 수 없습니다");
        }
        boardRepository.delete(board);
    }

    // 게시글 참여 신청 -> 즉시 매칭 확정 (게시글 행을 잠가서 동시에 눌러도 한 명만 확정)
    @Transactional
    public Map<String, Object> join_board(int boardId, User user){
        Board board = boardRepository.findByIdForUpdate(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글 없음"));
        if(board.getUserId().getUserAi().equals(user.getUserAi())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "본인 게시글에는 참여할 수 없습니다");
        }
        if(matchLogRepository.existsByBoard(board)){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 신청함 또는 모집 종료");
        }

        MatchLog matchLog = new MatchLog();
        matchLog.setBoard(board);
        matchLog.setHostUser(board.getUserId());
        matchLog.setGuestUser(user);
        matchLog.setCategoryId(board.getCategoryId());
        matchLog = matchLogRepository.save(matchLog);

        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setMatchLogId(matchLog);
        chatRoom = chatRoomRepository.save(chatRoom);

        return Map.of("matchLogId", matchLog.getMatchLogId(), "chatRoomId", chatRoom.getChatRoomId(), "message", "매칭 확정");
    }

    private Board find_board(int boardId){
        return boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글 없음"));
    }

    private Category find_category(int categoryId){
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 카테고리"));
    }

    private void check_board_input(post_board_DTO board){
        if(board.categoryId() == null || board.boardText() == null || board.boardText().isBlank()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "필수값 누락");
        }
    }

    private void check_writer(Board board, User user){
        if(!board.getUserId().getUserAi().equals(user.getUserAi())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자가 아닙니다");
        }
    }
}
