package com.mirim.backend.service;

import com.mirim.backend.DTO.category_DTO;
import com.mirim.backend.DTO.get_me_DTO;
import com.mirim.backend.DTO.patch_me_DTO;
import com.mirim.backend.DTO.sign_in_DTO;
import com.mirim.backend.DTO.sign_up_DTO;
import com.mirim.backend.Entity.User;
import com.mirim.backend.repository.Category_Repository;
import com.mirim.backend.repository.User_Repository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Service
public class User_Service {
    // 아이디 형식: 영문, 숫자, _ 4~20자
    private static final Pattern ID_PATTERN = Pattern.compile("^[A-Za-z0-9_]{4,20}$");

    private final User_Repository userRepository;
    private final Category_Repository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public User_Service(User_Repository userRepository, Category_Repository categoryRepository, PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public boolean createUser(sign_up_DTO user){
        // 400: 필수값 누락 / 형식 오류
        if(!is_valid_id(user.userId())
                || is_blank(user.userPw()) || user.userPw().length() < 8 || user.userPw().length() > 20
                || is_blank(user.userName()) || user.userName().length() > 30
                || is_blank(user.userNickname()) || user.userNickname().length() > 30
                || is_blank(user.userGender())
                || user.userAge() == null || user.userAge() <= 0
                || user.userLocal() == null
                || (!user.userLocal() && is_blank(user.userCountry()))){   // userCountry는 여행자만 필수
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "필수값 누락 또는 형식 오류");
        }
        if(user.categoryId() != null && !categoryRepository.existsById(user.categoryId())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 카테고리");
        }
        // 409: 이미 존재하는 아이디
        if(userRepository.existsByUserId(user.userId())){
            return false;
        }
        User user1 = new User();
        user1.setUserId(user.userId());
        user1.setUserPw(passwordEncoder.encode(user.userPw()));
        user1.setUserName(user.userName());
        user1.setUserNickname(user.userNickname());
        user1.setUserAge(user.userAge());
        user1.setUserLocal(user.userLocal());
        user1.setUserGender(user.userGender());
        user1.setUserCountry(user.userCountry());
        user1.setCategoryId(user.categoryId());

        userRepository.save(user1);
        return true;
    }

    public boolean is_valid_id(String user_id){
        return user_id != null && ID_PATTERN.matcher(user_id).matches();
    }

    public boolean check_id(String user_id){
        return userRepository.findByUserId(user_id).isEmpty();
    }

    public Optional<User> sign_in(sign_in_DTO user){
        if(user.userId() == null || user.userPw() == null){
            return Optional.empty();
        }
        return userRepository.findByUserId(user.userId()).filter(u -> passwordEncoder.matches(user.userPw(), u.getUserPw()));
    }

    // Authorization 헤더로 로그인한 사용자를 찾는다. (토큰 발급이 임시라서 accessToken = userId)
    // 헤더가 없거나 사용자를 못 찾으면 401
    // 로그인 때 발급한 토큰 -> 아이디 (서버 메모리, 서버 재시작하면 초기화)
    private final Map<String, String> tokens = new ConcurrentHashMap<>();

    public String issue_token(User user){
        String token = UUID.randomUUID().toString();
        tokens.put(token, user.getUserId());
        return token;
    }

    public void logout(String token){
        if(!is_blank(token)){
            tokens.remove(strip_bearer(token));
        }
    }

    // Authorization 헤더의 토큰으로 로그인한 사용자를 찾는다. 헤더가 없으면 세션에서 찾는다.
    // 토큰이 없거나 만료(로그아웃)되었으면 401
    public User get_user(String token){
        String user_id = null;
        if(!is_blank(token)){
            user_id = tokens.get(strip_bearer(token));
        } else {
            HttpSession session = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest().getSession(false);
            user_id = session == null ? null : (String) session.getAttribute("userId");
        }
        if(user_id == null){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 실패");
        }
        return userRepository.findByUserId(user_id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 실패"));
    }

    private String strip_bearer(String token){
        return (token.startsWith("Bearer ") ? token.substring(7) : token).trim();
    }

    public get_me_DTO get_me(User user){
        category_DTO category = null;
        if(user.getCategoryId() != null){
            category = categoryRepository.findById(user.getCategoryId())
                    .map(c -> new category_DTO(c.getCategoryId(), c.getCategoryName()))
                    .orElse(null);
        }
        return new get_me_DTO(user.getUserAi(), user.getUserId(), user.getUserName(), user.getUserNickname(),
                user.getUserAge(), user.getUserCountry(), user.getUserLocal(), category);
    }

    public void patch_me(User user, patch_me_DTO dto){
        // 400: 수정할 값이 없거나 유효하지 않은 값
        if(dto.userNickname() == null && dto.categoryId() == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "수정할 값이 없습니다");
        }
        if(dto.userNickname() != null && (is_blank(dto.userNickname()) || dto.userNickname().trim().length() > 30)){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 닉네임");
        }
        // 404: 존재하지 않는 카테고리
        if(dto.categoryId() != null && !categoryRepository.existsById(dto.categoryId())){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 카테고리");
        }
        if(dto.userNickname() != null){
            user.setUserNickname(dto.userNickname().trim());
        }
        if(dto.categoryId() != null){
            user.setCategoryId(dto.categoryId());
        }
        userRepository.save(user);
    }

    private boolean is_blank(String value){
        return value == null || value.isBlank();
    }

}
