package com.tnc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class PaymentServiceClient {

    @Value("${payment.service.url:http://localhost:8081}")
    private String paymentServiceUrl;

    @Autowired
    private RestTemplate restTemplate;

    public Double getBalance(Long userId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", userId.toString());
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    paymentServiceUrl + "/api/wallet/balance",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                if (data != null && data.get("balance") != null) {
                    return ((Number) data.get("balance")).doubleValue();
                }
            }
            return 0.0;
        } catch (Exception e) {
            // If payment service is unavailable, allow transactions (fail-open for demo)
            System.err.println("Payment service unavailable: " + e.getMessage());
            return Double.MAX_VALUE; // Allow transactions if payment service is down
        }
    };
    
    public boolean deductBalance(Long userId, Double amount) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", userId.toString());
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = Map.of("amount", amount);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    paymentServiceUrl + "/api/wallet/deduct",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            System.err.println("Payment service deduct failed: " + e.getMessage());
            return false;
        }
    }

    public boolean addBalance(Long userId, Double amount) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", userId.toString());
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = Map.of("amount", amount);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    paymentServiceUrl + "/api/wallet/add",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            System.err.println("Payment service add failed: " + e.getMessage());
            return false;
        }
    }

    public boolean initWallet(Long userId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", userId.toString());
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    paymentServiceUrl + "/api/wallet/init",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            System.err.println("Payment service init failed: " + e.getMessage());
            return false;
        }
    }
}

