package com.tnc.chatadvisor.model;

import lombok.Data;

@Data
public class ChatMessage {
    private String role; // user/ai
    private String content;
    private String updateType; // price/history/action

    public ChatMessage() {}

    public ChatMessage(String role, String content, String updateType) {
        this.role = role;
        this.content = content;
        this.updateType = updateType;
    }
}
