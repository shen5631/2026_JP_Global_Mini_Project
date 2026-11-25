package com.mirim.backend.service;

import com.mirim.backend.DTO.get_board_DTO;
import com.mirim.backend.DTO.get_board_list_DTO;
import com.mirim.backend.DTO.get_my_board_DTO;
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
    private final MatchEligibility_Service matchEligibility;

    public Board_Service(Board_Repository boardRepository, Category_Repository categoryRepository,
                         MatchLog_Repository matchLogRepository, ChatRoom_Repository chatRoomRepository,
                         MatchEligibility_Service matchEligibility) {
        this.boardRepository = boardRepository;
        this.categoryRepository = categoryRepository;
        this.matchLogRepository = matchLogRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.matchEligibility = matchEligibility;
    }

    public Map<String, Object> get_boards(Integer categoryId, int page, int size){
        if(page < 0 || size < 1 || size > 100){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 파라미터");
        }
        Page<Board> result = boardRepository.findOpenBoards(categoryId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "boardId")));
        List<get_board_list_DTO> boards = result.getContent().stream()

                .map(b -> new get_board_list_DTO(b.getBoardId(), b.getUserId().getUserNickname(),
                        b.getCategoryId().getCategoryName(), b.getBoardHead(), b.getBoardText(), b.getBoard_time()))

                .map(b -> new get_board_list_DTO(b.getBoardId(), b.getBoardHead(), b.getUserId().getUserNickname(),
                        b.getCategoryId().getCategoryName(), b.getBoardText(), b.getBoard_time()))
                .toList();
        return Map.of("boards", boards, "totalPages", result.getTotalPages(), "currentPage", result.getNumber());
    }

    public List<get_my_board_DTO> get_my_boards(User user){
        return boardRepository.findByWriter(user.getUserAi()).stream()
                .filter(b -> b.getStatus() != Board.Status.CLOSED)
                .map(b -> new get_my_board_DTO(b.getBoardId(), b.getUserId().getUserNickname(),
                        b.getCategoryId().getCategoryName(), b.getBoardHead(), b.getBoardText(), b.getBoard_time(),
                        b.getStatus().name(), b.getLockedByMatchLog() == null
                        ? null : b.getLockedByMatchLog().getMatchLogId()))
                .toList();
    }

    public get_board_DTO get_board(int boardId){
        Board board = find_board(boardId);
        if(board.getStatus() != Board.Status.OPEN){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "공개 중인 게시글이 없습니다");
        }
        User writer = board.getUserId();
        Category category = board.getCategoryId();
        return new get_board_DTO(board.getBoardId(), writer.getUserAi(), writer.getUserNickname(), writer.getUserCountry(),
                writer.getUserLocal(), category.getCategoryId(), category.getCategoryName(), board.getBoardHead(),
                board.getBoardText(), board.getBoard_time());
        return new get_board_DTO(board.getBoardId(), writer.getUserAi(), writer.getUserNickname(), writer.getUserGender(),
                writer.getUserAge(), writer.getUserCountry(), writer.getUserLocal(), category.getCategoryId(), category.getCategoryName(),
                board.getBoardHead(), board.getBoardText(), board.getBoard_time());
    }

    @Transactional
    public Board post_board(post_board_DTO board, User user){
        check_board_input(board);
        matchEligibility.lockUsers(user);
        check_local(user);
        matchEligibility.assertCanStart(user);
        Board board1 = new Board();
        board1.setUserId(user);
        board1.setCategoryId(find_category(board.categoryId()));
        board1.setBoardHead(resolve_title(board));
        board1.setBoardHead(board.title().trim());
        board1.setBoardText(board.boardText());

        return boardRepository.save(board1);
    }

    @Transactional
    public void put_board(int boardId, post_board_DTO board, User user){
        check_board_input(board);
        matchEligibility.lockUsers(user);
        matchEligibility.assertCanStart(user);
        Board board1 = find_board(boardId);
        check_writer(board1, user);
        if(board1.getStatus() != Board.Status.OPEN){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "공개 중인 게시글만 수정할 수 있습니다");
        }
        board1.setCategoryId(find_category(board.categoryId()));
        board1.setBoardHead(resolve_title(board));
        board1.setBoardHead(board.title().trim());
        board1.setBoardText(board.boardText());
        boardRepository.save(board1);
    }

    @Transactional
    public void delete_board(int boardId, User user){
        matchEligibility.lockUsers(user);
        Board board = boardRepository.findByIdForUpdate(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글 없음"));
        check_writer(board, user);
        if(board.getStatus() != Board.Status.OPEN){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "진행 중인 매칭 게시글은 취소 절차를 먼저 완료해주세요");
        }
        board.setStatus(Board.Status.CLOSED);
    }

    // 게시글 참여 신청 -> 즉시 매칭 확정 (게시글 행을 잠가서 동시에 눌러도 한 명만 확정)
    @Transactional
    public Map<String, Object> join_board(int boardId, User user){
        Board board = find_board(boardId);
        User host = board.getUserId();
        matchEligibility.lockUsers(host, user);
        board = boardRepository.findByIdForUpdate(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글 없음"));
        host = board.getUserId();
        matchEligibility.assertCanStart(user);
        matchEligibility.assertCanStart(host);
        if(user.getUserLocal()){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "여행객 계정만 모집글에 참여할 수 있습니다");
        }
        if(!host.getUserLocal()){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "현지인이 작성한 게시글만 신청할 수 있습니다");
        }
        if(board.getUserId().getUserAi().equals(user.getUserAi())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "본인 게시글에는 참여할 수 없습니다");
        }
        if(board.getStatus() != Board.Status.OPEN){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 비공개되었거나 모집이 종료된 게시글입니다");
        }

        MatchLog matchLog = new MatchLog();
        matchLog.setBoard(board);
        matchLog.setHostUser(board.getUserId());
        matchLog.setGuestUser(user);
        matchLog.setCategoryId(board.getCategoryId());
        matchLog = matchLogRepository.save(matchLog);

        List<Board> hostBoards = boardRepository.findOpenByWriterForUpdate(host.getUserAi());
        for(Board hostBoard : hostBoards){
            hostBoard.setStatus(Board.Status.MATCHED);
            hostBoard.setLockedByMatchLog(matchLog);
            hostBoard.setLockedByQuickMatch(null);
        }

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
        if(board.categoryId() == null || board.boardText() == null || board.boardText().isBlank()
                || (board.title() != null && board.title().trim().length() > 100)){
        if(board.categoryId() == null || board.title() == null || board.title().isBlank() || board.title().trim().length() > 100
                || board.boardText() == null || board.boardText().isBlank()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "필수값 누락");
        }
    }

    private String resolve_title(post_board_DTO board){
        if(board.title() != null && !board.title().isBlank()){
            return board.title().trim();
        }
        String firstLine = board.boardText().strip().split("\\R", 2)[0];
        return firstLine.length() <= 100 ? firstLine : "모집글";
    }

    private void check_local(User user){
        if(!user.getUserLocal()){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "현지인만 모집글을 작성할 수 있습니다");
        }
    }

    private void check_writer(Board board, User user){
        if(!board.getUserId().getUserAi().equals(user.getUserAi())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자가 아닙니다");
        }
    }
}
