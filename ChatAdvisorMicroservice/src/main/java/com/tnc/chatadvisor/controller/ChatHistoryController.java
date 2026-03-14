package com.tnc.chatadvisor.controller;

import com.tnc.chatadvisor.entity.ChatSession;
import com.tnc.chatadvisor.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/history")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class ChatHistoryController {

    private final ChatSessionRepository chatSessionRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<List<ChatSession>> getHistory(@PathVariable String userId) {
        List<ChatSession> history = chatSessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(history);
    }

    @PostMapping
    public ResponseEntity<ChatSession> saveSession(@RequestBody ChatSession session) {
        ChatSession saved = chatSessionRepository.save(session);
        return ResponseEntity.ok(saved);
    }
}
