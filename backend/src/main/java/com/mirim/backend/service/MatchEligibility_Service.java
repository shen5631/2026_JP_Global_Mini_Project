package com.mirim.backend.service;

import com.mirim.backend.Entity.QuickMatch;
import com.mirim.backend.Entity.Board;
import com.mirim.backend.Entity.User;
import com.mirim.backend.repository.Board_Repository;
import com.mirim.backend.repository.MatchLog_Repository;
import com.mirim.backend.repository.QuickMatch_Repository;
import com.mirim.backend.repository.User_Repository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;

@Service
public class MatchEligibility_Service {

    private final User_Repository userRepository;
    private final MatchLog_Repository matchLogRepository;
    private final QuickMatch_Repository quickMatchRepository;
    private final Board_Repository boardRepository;

    public MatchEligibility_Service(User_Repository userRepository,
                                   MatchLog_Repository matchLogRepository,
                                   QuickMatch_Repository quickMatchRepository,
                                   Board_Repository boardRepository) {
        this.userRepository = userRepository;
        this.matchLogRepository = matchLogRepository;
        this.quickMatchRepository = quickMatchRepository;
        this.boardRepository = boardRepository;
    }

    public void lockUsers(User... users) {
        Arrays.stream(users)
                .map(User::getUserAi)
                .distinct()
                .sorted()
                .forEach(userAi -> userRepository.findByIdForUpdate(userAi)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다")));
    }

    public void assertCanStart(User user) {
        if (matchLogRepository.countActiveForUser(user.getUserAi()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "진행 중인 매칭이 있어 새로운 매칭을 시작할 수 없습니다");
        }
        if (quickMatchRepository.existsByUserAndStatus(user, QuickMatch.Status.WAITING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 빠른 매칭 대기 중입니다");
        }
        if (boardRepository.existsByUserIdAndStatus(user, Board.Status.CANCEL_PENDING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "취소된 매칭의 모집글 처리 후 다시 시도해주세요");
        }
    }

    public void assertNoActiveMatch(User user) {
        if (matchLogRepository.countActiveForUser(user.getUserAi()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 진행 중인 매칭이 있습니다");
        }
    }
}
