package com.tnc.chatadvisor.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "openrouter")
public class ChatConfig {
    private String apiKey;
    private String model;
    private String baseUrl;
    private int maxTokens = 1500;
    private double temperature = 0.7;
}
