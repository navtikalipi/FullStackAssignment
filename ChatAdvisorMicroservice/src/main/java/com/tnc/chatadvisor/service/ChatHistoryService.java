package com.tnc.chatadvisor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tnc.chatadvisor.entity.ChatSession;
import com.tnc.chatadvisor.model.ChatResponse;
import com.tnc.chatadvisor.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatHistoryService {

    private final ChatSessionRepository chatSessionRepository;
    private final ObjectMapper objectMapper;

    public void saveChatSession(String userId, ChatResponse response) {
        try {
            ChatSession session = new ChatSession();
            session.setUserId(userId);
            session.setSessionId(UUID.randomUUID().toString());
            session.setMessagesJson(objectMapper.writeValueAsString(response.getConversation()));
            chatSessionRepository.save(session);
            log.info("Saved chat session for user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to save chat session for user {}: {}", userId, e.getMessage());
        }
    }
}
