package com.mirim.backend.service;

import com.mirim.backend.DTO.board_decision_DTO;
import com.mirim.backend.DTO.get_category_DTO;
import com.mirim.backend.DTO.get_match_DTO;
import com.mirim.backend.DTO.get_match_list_DTO;
import com.mirim.backend.Entity.Board;
import com.mirim.backend.Entity.Category;
import com.mirim.backend.Entity.ChatAppointment;
import com.mirim.backend.Entity.ChatRoom;
import com.mirim.backend.Entity.MatchLog;
import com.mirim.backend.Entity.QuickMatch;
import com.mirim.backend.Entity.User;
import com.mirim.backend.repository.Board_Repository;
import com.mirim.backend.repository.Category_Repository;
import com.mirim.backend.repository.ChatAppointment_Repository;
import com.mirim.backend.repository.ChatRoom_Repository;
import com.mirim.backend.repository.MatchLog_Repository;
import com.mirim.backend.repository.QuickMatch_Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class Match_Service {

    private static final String ANY_CATEGORY = "상관없음";

    private final Category_Repository categoryRepository;
    private final QuickMatch_Repository quickMatchRepository;
    private final MatchLog_Repository matchLogRepository;
    private final ChatRoom_Repository chatRoomRepository;
    private final ChatAppointment_Repository chatAppointmentRepository;
    private final Board_Repository boardRepository;
    private final MatchEligibility_Service matchEligibility;
    private final MatchNotification_Service notificationService;
    private final TransactionTemplate tx;

    private final ReentrantLock queueLock = new ReentrantLock();

    public Match_Service(Category_Repository categoryRepository, QuickMatch_Repository quickMatchRepository,
                         MatchLog_Repository matchLogRepository, ChatRoom_Repository chatRoomRepository,
                         ChatAppointment_Repository chatAppointmentRepository, Board_Repository boardRepository,
                         MatchEligibility_Service matchEligibility, MatchNotification_Service notificationService,
                         PlatformTransactionManager transactionManager) {
        this.categoryRepository = categoryRepository;
        this.quickMatchRepository = quickMatchRepository;
        this.matchLogRepository = matchLogRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.chatAppointmentRepository = chatAppointmentRepository;
        this.boardRepository = boardRepository;
        this.matchEligibility = matchEligibility;
        this.notificationService = notificationService;
        this.tx = new TransactionTemplate(transactionManager);
    }

    public List<get_category_DTO> get_categories(){
        return categoryRepository.findAll().stream()
                .map(c -> new get_category_DTO(c.getCategoryId(), c.getCategoryName(), c.getCategoryText()))
                .toList();
    }

    public Map<String, Object> request_quick(Integer categoryId, User user){
        if(categoryId == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리를 선택해주세요");
        }
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 카테고리"));

        queueLock.lock();
        try {
            Integer matchId = tx.execute(status -> {
                matchEligibility.lockUsers(user);
                matchEligibility.assertCanStart(user);

                QuickMatch mine = new QuickMatch();
                mine.setUser(user);
                mine.setCategory(category);
                mine = quickMatchRepository.save(mine);
                if(user.getUserLocal()){
                    for(Board board : boardRepository.findOpenByWriterForUpdate(user.getUserAi())){
                        board.setStatus(Board.Status.QUICK_WAITING);
                        board.setLockedByQuickMatch(mine);
                    }
                }
                return mine.getMatchId();
            });

            tx.executeWithoutResult(status -> {
                QuickMatch mine = quickMatchRepository.findById(matchId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "매칭 요청을 찾을 수 없습니다"));
                try_match(mine);
            });
            return Map.of("matchId", matchId, "status", "WAITING");
        } finally {
            queueLock.unlock();
        }
    }

    private void try_match(QuickMatch mine){
        User user = mine.getUser();
        boolean anyCategory = ANY_CATEGORY.equals(mine.getCategory().getCategoryName());
        List<QuickMatch> partners = quickMatchRepository.findPartners(user.getUserLocal(), user.getUserAi(),
                mine.getCategory().getCategoryId(), anyCategory, ANY_CATEGORY, PageRequest.of(0, 1));
        if(partners.isEmpty()){
            return;
        }
        QuickMatch partner = partners.get(0);
        matchEligibility.lockUsers(user, partner.getUser());
        if(mine.getStatus() != QuickMatch.Status.WAITING
                || partner.getStatus() != QuickMatch.Status.WAITING){
            return;
        }
        matchEligibility.assertNoActiveMatch(user);
        matchEligibility.assertNoActiveMatch(partner.getUser());

        Category category = anyCategory ? partner.getCategory() : mine.getCategory();
        MatchLog matchLog = new MatchLog();
        matchLog.setHostUser(user.getUserLocal() ? user : partner.getUser());
        matchLog.setGuestUser(user.getUserLocal() ? partner.getUser() : user);
        matchLog.setCategoryId(category);
        matchLog = matchLogRepository.save(matchLog);

        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setMatchLogId(matchLog);
        chatRoomRepository.save(chatRoom);

        QuickMatch localQuickMatch = mine.getUser().getUserLocal() ? mine : partner;
        for(Board board : boardRepository.findByLockedByQuickMatch(localQuickMatch)){
            board.setStatus(Board.Status.MATCHED);
            board.setLockedByMatchLog(matchLog);
            board.setLockedByQuickMatch(null);
        }

        mine.setStatus(QuickMatch.Status.MATCHED);
        mine.setMatchLog(matchLog);
        partner.setStatus(QuickMatch.Status.MATCHED);
        partner.setMatchLog(matchLog);
        quickMatchRepository.save(mine);
        quickMatchRepository.save(partner);
    }

    public Map<String, Object> get_quick_status(User user){
        QuickMatch latest = find_active(user);
        Map<String, Object> result = new HashMap<>();
        result.put("status", latest.getStatus().name());
        if(latest.getStatus() == QuickMatch.Status.MATCHED){
            result.put("matchLogId", latest.getMatchLog().getMatchLogId());
        }
        return result;
    }

    public void cancel_quick(User user){
        queueLock.lock();
        try {
            tx.executeWithoutResult(status -> {
                matchEligibility.lockUsers(user);
                QuickMatch latest = find_active(user);
                if(latest.getStatus() == QuickMatch.Status.MATCHED){
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 매칭이 확정되었습니다");
                }
                latest.setStatus(QuickMatch.Status.CANCELED);
                quickMatchRepository.save(latest);
                for(Board board : boardRepository.findByLockedByQuickMatch(latest)){
                    if(board.getStatus() == Board.Status.QUICK_WAITING){
                        board.setStatus(Board.Status.OPEN);
                        board.setLockedByQuickMatch(null);
                    }
                }
            });
        } finally {
            queueLock.unlock();
        }
    }

    @Transactional
    public void cancel_match(int matchLogId, User user){
        MatchLog matchLog = matchLogRepository.findByIdForUpdate(matchLogId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "매칭 없음"));
        if(!is_participant(matchLog, user)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "참여자가 아닙니다");
        }
        if(matchLog.getStatus() != MatchLog.Status.ACTIVE){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 종료된 매칭입니다");
        }

        matchEligibility.lockUsers(matchLog.getHostUser(), matchLog.getGuestUser());
        matchLog.setStatus(MatchLog.Status.CANCELED);
        matchLog.setCanceledBy(user);
        matchLog.setCanceledAt(LocalDateTime.now());

        ChatRoom chatRoom = chatRoomRepository.findByMatchLogForUpdate(matchLog)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방 없음"));
        chatRoom.setChatRoomActive(false);
        chatAppointmentRepository.findByChatRoom(chatRoom).ifPresent(chatAppointmentRepository::delete);

        for(Board board : boardRepository.findByLockedByMatchLog(matchLog)){
            board.setStatus(Board.Status.CANCEL_PENDING);
        }
        for(QuickMatch quickMatch : quickMatchRepository.findByMatchLog(matchLog)){
            quickMatch.setStatus(QuickMatch.Status.CANCELED);
        }

        boolean hostNeedsBoardDecision = boardRepository.findByLockedByMatchLog(matchLog).stream()
                .anyMatch(board -> board.getStatus() == Board.Status.CANCEL_PENDING);
        if(!matchLog.getHostUser().getUserAi().equals(user.getUserAi()) || hostNeedsBoardDecision){
            notificationService.notifyMatchCanceled(matchLog, matchLog.getHostUser(), user);
        }
        if(!matchLog.getGuestUser().getUserAi().equals(user.getUserAi())){
            notificationService.notifyMatchCanceled(matchLog, matchLog.getGuestUser(), user);
        }
    }

    @Transactional
    public void decide_canceled_board(int matchLogId, int boardId, board_decision_DTO decision, User user){
        MatchLog matchLog = matchLogRepository.findByIdForUpdate(matchLogId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "매칭 없음"));
        if(!matchLog.getHostUser().getUserAi().equals(user.getUserAi())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "모집글 작성자만 공개 여부를 결정할 수 있습니다");
        }
        if(matchLog.getStatus() != MatchLog.Status.CANCELED){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "취소된 매칭의 게시글만 처리할 수 있습니다");
        }
        matchEligibility.lockUsers(user);
        matchEligibility.assertNoActiveMatch(user);
        Board board = boardRepository.findByIdForUpdate(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글 없음"));
        if(board.getStatus() != Board.Status.CANCEL_PENDING
                || board.getLockedByMatchLog() == null
                || board.getLockedByMatchLog().getMatchLogId() != matchLogId){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이 매칭으로 처리할 게시글이 아닙니다");
        }
        if(decision == null || decision.action() == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "게시글 처리 방법을 선택해주세요");
        }
        if("REOPEN".equals(decision.action())){
            board.setStatus(Board.Status.OPEN);
            board.setLockedByMatchLog(null);
            board.setLockedByQuickMatch(null);
        } else if("CLOSE".equals(decision.action())){
            board.setStatus(Board.Status.CLOSED);
            board.setLockedByMatchLog(null);
            board.setLockedByQuickMatch(null);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "지원하지 않는 게시글 처리 방법입니다");
        }
    }

    @Transactional
    public void complete_match(int matchLogId){
        MatchLog matchLog = matchLogRepository.findByIdForUpdate(matchLogId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "매칭 없음"));
        if(matchLog.getStatus() != MatchLog.Status.ACTIVE){
            return;
        }
        matchLog.setStatus(MatchLog.Status.COMPLETED);
        for(Board board : boardRepository.findByLockedByMatchLog(matchLog)){
            board.setStatus(Board.Status.CLOSED);
            board.setLockedByMatchLog(null);
            board.setLockedByQuickMatch(null);
        }
    }

    public get_match_DTO get_match(int matchLogId, User user){
        MatchLog matchLog = matchLogRepository.findById(matchLogId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "매칭 없음"));
        if(!is_participant(matchLog, user)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "참여자가 아닙니다");
        }
        User partner = partner_of(matchLog, user);
        Integer chatRoomId = chatRoomRepository.findByMatchLogId(matchLog).map(ChatRoom::getChatRoomId).orElse(null);
        Integer canceledByUserAi = matchLog.getCanceledBy() == null
                ? null : matchLog.getCanceledBy().getUserAi();
        return new get_match_DTO(matchLog.getMatchLogId(), chatRoomId, matchLog.getCategoryId().getCategoryName(),
                matchLog.getMatchLogTime(), matchLog.getStatus().name(), canceledByUserAi,
                new get_match_DTO.Partner(partner.getUserAi(), partner.getUserNickname(), partner.getUserAge(),
                        partner.getUserCountry(), partner.getUserLocal()));
    }

    public Map<String, Object> get_my_matches(User user, int page, int size){
        if(page < 0 || size < 1 || size > 100){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 파라미터");
        }
        Page<MatchLog> result = matchLogRepository.findByParticipant(user.getUserAi(),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "matchLogId")));
        List<get_match_list_DTO> matches = result.getContent().stream()
                .map(m -> new get_match_list_DTO(m.getMatchLogId(), m.getCategoryId().getCategoryName(),
                        partner_of(m, user).getUserNickname(), m.getMatchLogTime(), m.getStatus().name()))
                .toList();
        return Map.of("matches", matches, "totalPages", result.getTotalPages(), "currentPage", result.getNumber());
    }

    private QuickMatch find_active(User user){
        return quickMatchRepository.findFirstByUserOrderByMatchIdDesc(user)
                .filter(q -> q.getStatus() != QuickMatch.Status.CANCELED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "진행 중인 요청이 없습니다"));
    }

    private boolean is_participant(MatchLog matchLog, User user){
        return matchLog.getHostUser().getUserAi().equals(user.getUserAi())
                || matchLog.getGuestUser().getUserAi().equals(user.getUserAi());
    }

    private User partner_of(MatchLog matchLog, User user){
        return matchLog.getHostUser().getUserAi().equals(user.getUserAi())
                ? matchLog.getGuestUser() : matchLog.getHostUser();
    }
}
