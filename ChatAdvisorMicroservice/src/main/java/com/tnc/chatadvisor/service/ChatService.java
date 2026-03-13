package com.tnc.chatadvisor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tnc.chatadvisor.config.ChatConfig;
import com.tnc.chatadvisor.config.BackendConfig;
import com.tnc.chatadvisor.config.ChatProperties;
import com.tnc.chatadvisor.model.ChatRequest;
import com.tnc.chatadvisor.model.ChatResponse;
import com.tnc.chatadvisor.model.ChatMessage;
import com.tnc.chatadvisor.service.ChatHistoryService;
import javax.validation.Valid;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;


import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatConfig chatConfig;
    private final BackendConfig backendConfig;
    private final ChatProperties chatProperties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ChatHistoryService chatHistoryService;

    public ChatResponse processChat(@Valid ChatRequest request) {
        ChatResponse response = new ChatResponse();
        response.setTimestamp(System.currentTimeMillis());

        try {
            // Step 1: Extract intent from message (basic parsing)
            String intent = parseIntent(request.getMessage());
            Map<String, Object> contextData = fetchContextData(intent, request);

            // Step 2: Build system prompt with context
            String systemPrompt = buildSystemPrompt(intent, contextData);

            // Step 3: Call OpenRouter
            String aiResponse = callOpenRouter(request.getMessage(), systemPrompt);

            // Step 4: Execute actions if needed (buy/sell simulation)
            if (intent.startsWith("BUY") || intent.startsWith("SELL")) {
                executeTrade(intent, request);
            }

            // Build response
            response.setSuccess(true);
            response.setMessage("AI Advisor");
            response.getConversation().add(new ChatMessage("user", request.getMessage(), null));
            response.getConversation().add(new ChatMessage("ai", aiResponse, intent));

        } catch (Exception e) {
            log.error("Chat processing error", e);
            response.setSuccess(false);
            response.setMessage("Sorry, I encountered an error: " + e.getMessage());
        }

        return response;
    }

    private String parseIntent(String message) {
        message = message.toUpperCase();
        if (message.contains("BUY") || message.contains("PURCHASE")) {
            return "BUY:" + extractSymbol(message);
        } else if (message.contains("SELL") || message.contains("SHORT")) {
            return "SELL:" + extractSymbol(message);
        } else if (message.contains("PRICE") || message.contains("QUOTE")) {
            return "PRICE:" + extractSymbol(message);
        } else if (message.contains("HISTORY") || message.contains("PERFORMANCE")) {
            return "HISTORY:" + extractSymbol(message);
        } else if (message.contains("HOLDINGS") || message.contains("PORTFOLIO")) {
            return "HOLDINGS";
        } else {
            return "GENERAL";
        }
    }

    private String extractSymbol(String message) {
        // Improved symbol extraction using regex
        Pattern pattern = Pattern.compile("\\b[A-Z]{1,5}\\b");
        Matcher matcher = pattern.matcher(message.toUpperCase());
        if (matcher.find()) {
            return matcher.group();
        }
        return "AAPL"; // default
    }

    private Map<String, Object> fetchContextData(String intent, ChatRequest request) {
        Map<String, Object> data = new HashMap<>();
        String symbol = extractSymbol(request.getMessage());

        try {
            HttpHeaders headers = new HttpHeaders();
            if (request.getAuthToken() != null) {
                headers.setBearerAuth(request.getAuthToken());
            }
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Fetch live price
            if (intent.contains("PRICE")) {
                String url = backendConfig.getUrl() + backendConfig.getMarketPath() + "/price/" + symbol;
                ResponseEntity<String> priceResp = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
                data.put("currentPrice", priceResp.getBody());
            }

            // Fetch holdings
            if (intent.contains("HOLDINGS")) {
                String url = backendConfig.getUrl() + backendConfig.getHoldingsPath();
                ResponseEntity<String> holdingsResp = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
                data.put("holdings", holdingsResp.getBody());
            }

        } catch (Exception e) {
            log.warn("Context data fetch failed", e);
        }

        return data;
    }

    private String buildSystemPrompt(String intent, Map<String, Object> context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are Stockfolio ChatAdvisor, an expert stock market assistant. ");
        prompt.append("Use live data provided in context. ");
        prompt.append("Respond conversationally but concisely. Current intent: ").append(intent).append(". ");
        prompt.append("Context data: ").append(context).append("\n");
        return prompt.toString();
    }

    private String callOpenRouter(String userMessage, String systemPrompt) throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", chatConfig.getModel());
        requestBody.put("messages", List.of(
            Map.of("role", "system", "content", systemPrompt),
            Map.of("role", "user", "content", userMessage)
        ));
        requestBody.put("max_tokens", chatProperties.getMaxTokens());
        requestBody.put("temperature", chatProperties.getTemperature());

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(chatConfig.getApiKey());
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String url = chatConfig.getBaseUrl() + "/chat/completions";
        ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);

        Map<String, Object> body = resp.getBody();
        List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");

        return (String) message.get("content");
    }

    private void executeTrade(String intent, ChatRequest request) {
        String[] parts = intent.split(":");
        String action = parts[0]; // BUY/SELL
        String symbol = parts.length > 1 ? parts[1] : "AAPL";
        
        // Parse quantity from message (simple, e.g. "buy 10 AAPL")
        String upperMsg = request.getMessage().toUpperCase();
        Pattern qtyPattern = Pattern.compile("\\b(\\d+)\\b");
        Matcher qtyMatcher = qtyPattern.matcher(upperMsg);
        double quantity = qtyMatcher.find() ? Double.parseDouble(qtyMatcher.group(1)) : 1.0;
        
        Map<String, Object> tradeReq = new HashMap<>();
        tradeReq.put("action", action.toLowerCase());
        tradeReq.put("symbol", symbol);
        tradeReq.put("quantity", quantity);
        tradeReq.put("userId", request.getUserId());
        
        HttpHeaders headers = new HttpHeaders();
        if (request.getAuthToken() != null) {
            headers.setBearerAuth(request.getAuthToken());
        }
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map> entity = new HttpEntity<>(tradeReq, headers);
        
        String url = backendConfig.getUrl() + backendConfig.getTransactionsPath();
        ResponseEntity<String> resp = restTemplate.postForEntity(url, entity, String.class);
        
        log.info("Trade executed: {} - Response: {}", intent, resp.getBody());
        // Note: response is local to processChat, can't access here. Log instead.
    }
}
