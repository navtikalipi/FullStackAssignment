package com.tnc.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/reports")
@CrossOrigin
public class ReportsController {

    @PostMapping("/generate")
    public ResponseEntity<?> generateReport(@RequestBody Map<String, Object> request, Authentication authentication) {
        String username = authentication.getName();
        
        String reportType = (String) request.get("type");
        String period = (String) request.get("period");
        String format = (String) request.get("format");
        
        // Generate a report ID
        String reportId = "rpt_" + UUID.randomUUID().toString().substring(0, 8);
        
        Map<String, Object> data = new HashMap<>();
        data.put("reportId", reportId);
        data.put("status", "processing");
        data.put("createdAt", java.time.Instant.now().toString());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Report generation started");
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
