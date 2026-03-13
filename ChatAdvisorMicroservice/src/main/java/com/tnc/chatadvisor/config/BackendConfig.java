package com.tnc.chatadvisor.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "backend")
public class BackendConfig {
    private String url = "http://backend:8080";
    private String marketPath = "/market";
    private String transactionsPath = "/transactions";
    private String holdingsPath = "/holdings";
}
