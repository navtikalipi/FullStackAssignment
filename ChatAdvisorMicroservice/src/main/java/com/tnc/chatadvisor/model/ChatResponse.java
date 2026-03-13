package com.tnc.chatadvisor.model;

import lombok.Data;
import java.util.List;
import java.util.ArrayList;

@Data
public class ChatResponse {
    private boolean success;
    private String message;
    private List<ChatMessage> conversation = new ArrayList<>();
    private long timestamp;
}
