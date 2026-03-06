package com.payment.controller;

import com.payment.entity.WalletBalance;
import com.payment.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(@RequestHeader("X-User-Id") Long userId) {
        try {
            Double balance = paymentService.getBalance(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Balance retrieved successfully");
            response.put("data", Map.of("userId", userId, "balance", balance));
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestHeader("X-User-Id") Long userId, @RequestBody Map<String, Object> request) {
        try {
            Double amount = ((Number) request.get("amount")).doubleValue();
            
            WalletBalance wallet = paymentService.deposit(userId, amount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Deposit successful");
            response.put("data", Map.of(
                "userId", userId,
                "amount", amount,
                "newBalance", wallet.getBalance()
            ));
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestHeader("X-User-Id") Long userId, @RequestBody Map<String, Object> request) {
        try {
            Double amount = ((Number) request.get("amount")).doubleValue();
            
            WalletBalance wallet = paymentService.withdraw(userId, amount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Withdrawal successful");
            response.put("data", Map.of(
                "userId", userId,
                "amount", amount,
                "newBalance", wallet.getBalance()
            ));
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/init")
    public ResponseEntity<?> initWallet(@RequestHeader("X-User-Id") Long userId) {
        try {
            WalletBalance wallet = paymentService.createWalletIfNotExists(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Wallet initialized");
            response.put("data", Map.of("userId", userId, "balance", wallet.getBalance()));
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/deduct")
    public ResponseEntity<?> deduct(@RequestHeader("X-User-Id") Long userId, @RequestBody Map<String, Object> request) {
        try {
            Double amount = ((Number) request.get("amount")).doubleValue();
            
            boolean success = paymentService.deductBalanceForPurchase(userId, amount);
            
            Map<String, Object> response = new HashMap<>();
            if (success) {
                Double newBalance = paymentService.getBalance(userId);
                response.put("success", true);
                response.put("message", "Balance deducted successfully");
                response.put("data", Map.of(
                    "userId", userId,
                    "amount", amount,
                    "newBalance", newBalance
                ));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Insufficient balance");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestHeader("X-User-Id") Long userId, @RequestBody Map<String, Object> request) {
        try {
            Double amount = ((Number) request.get("amount")).doubleValue();
            
            paymentService.addBalanceForSale(userId, amount);
            Double newBalance = paymentService.getBalance(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Balance added successfully");
            response.put("data", Map.of(
                "userId", userId,
                "amount", amount,
                "newBalance", newBalance
            ));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

