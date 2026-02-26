package com.tnc.domain.transaction.controller;

import com.tnc.common.security.CurrentUserService;
import com.tnc.domain.transaction.dto.TransactionDTO;
import com.tnc.domain.transaction.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolios/{portfolioId}/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final CurrentUserService currentUserService;

    @PostMapping
        public ResponseEntity<TransactionDTO.TransactionResponse> createTransaction(
            Authentication authentication,
            @PathVariable Long portfolioId,
            @RequestBody TransactionDTO.TransactionRequest request) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        
        TransactionDTO.TransactionResponse transaction = transactionService.createTransaction(
                userId, portfolioId, request);
                return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @GetMapping
        public ResponseEntity<List<TransactionDTO.TransactionResponse>> getTransactions(
            Authentication authentication,
            @PathVariable Long portfolioId,
            Pageable pageable) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        
                List<TransactionDTO.TransactionResponse> transactions = transactionService.getPortfolioTransactions(
                userId, portfolioId, pageable);
                return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{transactionId}")
        public ResponseEntity<TransactionDTO.TransactionResponse> getTransaction(
            Authentication authentication,
            @PathVariable Long portfolioId,
            @PathVariable Long transactionId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        
        TransactionDTO.TransactionResponse transaction = transactionService.getTransaction(
                userId, portfolioId, transactionId);
                return ResponseEntity.ok(transaction);
    }

    @GetMapping("/stock/{stockId}")
        public ResponseEntity<List<TransactionDTO.TransactionResponse>> getStockTransactions(
            Authentication authentication,
            @PathVariable Long portfolioId,
            @PathVariable Long stockId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        
        List<TransactionDTO.TransactionResponse> transactions = transactionService.getStockTransactions(
                userId, portfolioId, stockId);
                return ResponseEntity.ok(transactions);
    }

    @PutMapping("/{transactionId}")
        public ResponseEntity<TransactionDTO.TransactionResponse> updateTransaction(
            Authentication authentication,
            @PathVariable Long portfolioId,
            @PathVariable Long transactionId,
            @RequestBody TransactionDTO.TransactionUpdateRequest request) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        
        TransactionDTO.TransactionResponse transaction = transactionService.updateTransaction(
                userId, portfolioId, transactionId, request);
                return ResponseEntity.ok(transaction);
    }

    @DeleteMapping("/{transactionId}")
        public ResponseEntity<Void> deleteTransaction(
            Authentication authentication,
            @PathVariable Long portfolioId,
            @PathVariable Long transactionId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        
        transactionService.deleteTransaction(userId, portfolioId, transactionId);
                return ResponseEntity.noContent().build();
    }
}
