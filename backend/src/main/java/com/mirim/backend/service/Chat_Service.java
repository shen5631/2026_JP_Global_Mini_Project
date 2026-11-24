package com.mirim.backend.service;

import com.mirim.backend.DTO.get_message_DTO;
import com.mirim.backend.Entity.ChatMessage;
import com.mirim.backend.Entity.ChatRoom;
import com.mirim.backend.Entity.MatchLog;
import com.mirim.backend.Entity.User;
import com.mirim.backend.repository.ChatMessage_Repository;
import com.mirim.backend.repository.ChatRoom_Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class Chat_Service {

    private static final int MAX_CONTENT_LENGTH = 1000;

    private final ChatRoom_Repository chatRoomRepository;
    private final ChatMessage_Repository chatMessageRepository;

    public Chat_Service(ChatRoom_Repository chatRoomRepository, ChatMessage_Repository chatMessageRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    // 메시지 조회: 오래된 메시지부터 (page 0 = 가장 오래된 메시지)
    public Map<String, Object> get_messages(int chatRoomId, int page, int size, User user){
        if(page < 0 || size < 1 || size > 100){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 파라미터");
        }
        ChatRoom chatRoom = find_room_for(chatRoomId, user);
        Page<ChatMessage> result = chatMessageRepository.findByChatRoom(chatRoom,
                PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "messageId")));
        List<get_message_DTO> messages = result.getContent().stream()
                .map(m -> new get_message_DTO(m.getMessageId(), m.getSender().getUserAi(),
                        m.getSender().getUserNickname(), m.getContent(), m.getSentTime()))
                .toList();
        return Map.of("messages", messages, "totalPages", result.getTotalPages(), "currentPage", result.getNumber());
    }

    public Map<String, Object> send_message(int chatRoomId, String content, User user){
        ChatRoom chatRoom = find_room_for(chatRoomId, user);
        if(content == null || content.isBlank()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "빈 메시지는 보낼 수 없습니다");
        }
        if(content.length() > MAX_CONTENT_LENGTH){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "메시지는 " + MAX_CONTENT_LENGTH + "자 이내로 입력해주세요");
        }
        ChatMessage message = new ChatMessage();
        message.setChatRoom(chatRoom);
        message.setSender(user);
        message.setContent(content);
        message = chatMessageRepository.save(message);
        return Map.of("messageId", message.getMessageId(), "sentTime", message.getSentTime());
    }

    // 채팅방이 없으면 404, 매칭 참여자(host/guest)가 아니면 403
    private ChatRoom find_room_for(int chatRoomId, User user){
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방 없음"));
        MatchLog matchLog = chatRoom.getMatchLogId();
        boolean participant = matchLog.getHostUser().getUserAi().equals(user.getUserAi())
                || matchLog.getGuestUser().getUserAi().equals(user.getUserAi());
        if(!participant){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "참여자가 아닙니다");
        }
        return chatRoom;
    }
}
