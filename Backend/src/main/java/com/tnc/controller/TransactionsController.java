package com.tnc.controller;

import com.tnc.domain.transaction.entity.Transaction;
import com.tnc.service.TransactionsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transactions")
@CrossOrigin
public class TransactionsController {

    @Autowired
    private TransactionsService transactionsService;

    @GetMapping
    public ResponseEntity<?> getAllTransactions(
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "50") Integer limit,
            @RequestParam(required = false, defaultValue = "0") Integer offset,
            Authentication authentication) {
        
        String username = authentication.getName();
        List<Transaction> transactions = transactionsService.getAllTransactions(username, type, limit, offset);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Transactions retrieved");
        response.put("data", transactions);
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        
        return transactionsService.getTransactionById(id, username)
                .map(transaction -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Transaction retrieved");
                    response.put("data", transaction);
                    response.put("timestamp", System.currentTimeMillis());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Transaction not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody Map<String, Object> request, Authentication authentication) {
        String username = authentication.getName();
        
        Transaction transaction = new Transaction();
        transaction.setSymbol(((String) request.get("symbol")).toUpperCase());
        transaction.setType(((String) request.get("type")).toUpperCase());
        transaction.setQuantity(((Number) request.get("quantity")).doubleValue());
        transaction.setPrice(((Number) request.get("price")).doubleValue());
        
        if (request.containsKey("date") && request.get("date") != null) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                transaction.setTransactionDate(sdf.parse((String) request.get("date")));
            } catch (Exception e) {
                // Fall back to current date if parsing fails
            }
        }
        
        if (request.containsKey("notes")) {
            transaction.setNotes((String) request.get("notes"));
        }
        
        Transaction savedTransaction = transactionsService.createTransaction(transaction, username);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Transaction created successfully");
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", savedTransaction.getId());
        data.put("symbol", savedTransaction.getSymbol());
        data.put("type", savedTransaction.getType());
        data.put("quantity", savedTransaction.getQuantity());
        data.put("price", savedTransaction.getPrice());
        data.put("total", savedTransaction.getQuantity() * savedTransaction.getPrice());
        data.put("date", savedTransaction.getTransactionDate());
        
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
