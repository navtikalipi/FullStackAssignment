package com.tnc.chatadvisor.controller;

import com.tnc.chatadvisor.model.ChatRequest;
import com.tnc.chatadvisor.model.ChatResponse;
import com.tnc.chatadvisor.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import java.time.Duration;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://stockfolio.duckdns.org", "https://stockfolio.duckdns.org", "http://localhost"})
public class ChatAdvisorController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        ChatResponse response = chatService.processChat(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/stream/{sessionId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamUpdates(@PathVariable String sessionId) {
        return Flux.interval(Duration.ofSeconds(10))
            .map(i -> "data: {\"type\":\"price_update\", \"symbol\":\"" + sessionId + "\", \"timestamp\":" + System.currentTimeMillis() + "}\n\n");
    }
}
