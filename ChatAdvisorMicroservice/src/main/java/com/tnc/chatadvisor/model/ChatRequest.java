package com.tnc.chatadvisor.model;

import lombok.Data;

@Data
public class ChatRequest {
    private String message;
    private String userId;
    private String authToken; // Forwarded JWT
}
