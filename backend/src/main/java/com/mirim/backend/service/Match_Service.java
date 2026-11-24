package com.mirim.backend.service;

import com.mirim.backend.DTO.get_category_DTO;
import com.mirim.backend.DTO.get_match_DTO;
import com.mirim.backend.DTO.get_match_list_DTO;
import com.mirim.backend.Entity.Category;
import com.mirim.backend.Entity.ChatRoom;
import com.mirim.backend.Entity.MatchLog;
import com.mirim.backend.Entity.QuickMatch;
import com.mirim.backend.Entity.User;
import com.mirim.backend.repository.Category_Repository;
import com.mirim.backend.repository.ChatRoom_Repository;
import com.mirim.backend.repository.MatchLog_Repository;
import com.mirim.backend.repository.QuickMatch_Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

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
    private final TransactionTemplate tx;

    // 요청/취소를 한 줄로 세워서 두 명이 동시에 요청해도 서로를 놓치지 않게 한다. (서버 1대 기준)
    private final ReentrantLock queueLock = new ReentrantLock();

    public Match_Service(Category_Repository categoryRepository, QuickMatch_Repository quickMatchRepository,
                         MatchLog_Repository matchLogRepository, ChatRoom_Repository chatRoomRepository,
                         PlatformTransactionManager transactionManager) {
        this.categoryRepository = categoryRepository;
        this.quickMatchRepository = quickMatchRepository;
        this.matchLogRepository = matchLogRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.tx = new TransactionTemplate(transactionManager);
    }

    public List<get_category_DTO> get_categories(){
        return categoryRepository.findAll().stream()
                .map(c -> new get_category_DTO(c.getCategoryId(), c.getCategoryName(), c.getCategoryText()))
                .toList();
    }

    // 빠른 매칭 요청: 대기열에 등록하고, 맞는 상대가 이미 있으면 바로 매칭 확정
    // 응답은 항상 WAITING (확정 여부는 status 조회로 확인)
    public Map<String, Object> request_quick(Integer categoryId, User user){
        if(categoryId == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리를 선택해주세요");
        }
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 카테고리"));

        queueLock.lock();
        try {
            return tx.execute(status -> {
                QuickMatch latest = quickMatchRepository.findFirstByUserOrderByMatchIdDesc(user).orElse(null);
                if(latest != null && latest.getStatus() == QuickMatch.Status.WAITING){
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 진행 중인 매칭이 있습니다");
                }

                QuickMatch mine = new QuickMatch();
                mine.setUser(user);
                mine.setCategory(category);
                mine = quickMatchRepository.save(mine);

                try_match(mine);
                return Map.<String, Object>of("matchId", mine.getMatchId(), "status", "WAITING");
            });
        } finally {
            queueLock.unlock();
        }
    }

    // 대기열에서 상대를 찾아 매칭 확정 (현지인이 host, 여행자가 guest)
    private void try_match(QuickMatch mine){
        User user = mine.getUser();
        boolean anyCategory = ANY_CATEGORY.equals(mine.getCategory().getCategoryName());
        List<QuickMatch> partners = quickMatchRepository.findPartners(user.getUserLocal(), user.getUserAi(),
                mine.getCategory().getCategoryId(), anyCategory, ANY_CATEGORY, PageRequest.of(0, 1));
        if(partners.isEmpty()){
            return;
        }
        QuickMatch partner = partners.get(0);

        // 둘 중 구체적인 카테고리가 있으면 그걸로 확정
        Category category = anyCategory ? partner.getCategory() : mine.getCategory();

        MatchLog matchLog = new MatchLog();
        matchLog.setHostUser(user.getUserLocal() ? user : partner.getUser());
        matchLog.setGuestUser(user.getUserLocal() ? partner.getUser() : user);
        matchLog.setCategoryId(category);
        matchLog = matchLogRepository.save(matchLog);

        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setMatchLogId(matchLog);
        chatRoomRepository.save(chatRoom);

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
                QuickMatch latest = find_active(user);
                if(latest.getStatus() == QuickMatch.Status.MATCHED){
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 매칭이 확정되었습니다");
                }
                latest.setStatus(QuickMatch.Status.CANCELED);
                quickMatchRepository.save(latest);
            });
        } finally {
            queueLock.unlock();
        }
    }

    // 취소되지 않은 가장 최근 요청 (없으면 404)
    private QuickMatch find_active(User user){
        return quickMatchRepository.findFirstByUserOrderByMatchIdDesc(user)
                .filter(q -> q.getStatus() != QuickMatch.Status.CANCELED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "진행 중인 요청이 없습니다"));
    }

    public get_match_DTO get_match(int matchLogId, User user){
        MatchLog matchLog = matchLogRepository.findById(matchLogId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "매칭 없음"));
        if(!is_participant(matchLog, user)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "참여자가 아닙니다");
        }
        User partner = partner_of(matchLog, user);
        Integer chatRoomId = chatRoomRepository.findByMatchLogId(matchLog).map(ChatRoom::getChatRoomId).orElse(null);
        return new get_match_DTO(matchLog.getMatchLogId(), chatRoomId, matchLog.getCategoryId().getCategoryName(), matchLog.getMatchLogTime(),
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
                        partner_of(m, user).getUserNickname(), m.getMatchLogTime()))
                .toList();
        return Map.of("matches", matches, "totalPages", result.getTotalPages(), "currentPage", result.getNumber());
    }

    private boolean is_participant(MatchLog matchLog, User user){
        return matchLog.getHostUser().getUserAi().equals(user.getUserAi())
                || matchLog.getGuestUser().getUserAi().equals(user.getUserAi());
    }

    private User partner_of(MatchLog matchLog, User user){
        return matchLog.getHostUser().getUserAi().equals(user.getUserAi()) ? matchLog.getGuestUser() : matchLog.getHostUser();
    }
}
