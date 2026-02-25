package com.tnc.domain.transaction.service;

import com.tnc.common.exception.ResourceNotFoundException;
import com.tnc.domain.transaction.dto.TransactionCreateRequest;
import com.tnc.domain.transaction.dto.TransactionResponse;
import com.tnc.domain.transaction.dto.TransactionUpdateRequest;
import com.tnc.domain.transaction.entity.Transaction;
import com.tnc.domain.transaction.mapper.TransactionMapper;
import com.tnc.domain.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final TransactionValidationService validationService;

    public TransactionResponse createTransaction(TransactionCreateRequest request) {
        validationService.validateCreateRequest(request);
        Transaction transaction = transactionMapper.toEntity(request);
        transaction.setIsActive(true);
        Transaction saved = transactionRepository.save(transaction);
        log.info("Transaction created: {} - {}", saved.getId(), saved.getSymbol());
        return transactionMapper.toResponse(saved);
    }

    public TransactionResponse updateTransaction(Long id, TransactionUpdateRequest request) {
        validationService.validateUpdateRequest(request);
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        transactionMapper.updateEntity(request, transaction);
        Transaction updated = transactionRepository.save(transaction);
        log.info("Transaction updated: {} - {}", updated.getId(), updated.getSymbol());
        return transactionMapper.toResponse(updated);
    }

    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        transaction.setIsActive(false);
        transactionRepository.save(transaction);
        log.info("Transaction deleted (soft): {}", id);
    }

    public TransactionResponse getTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        return transactionMapper.toResponse(transaction);
    }

    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .filter(t -> t.getIsActive() != null && t.getIsActive())
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getTransactionsBySymbol(String symbol) {
        return transactionRepository.findActiveTransactionsBySymbol(symbol).stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findTransactionsByDateRange(startDate, endDate).stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<String> getAllSymbols() {
        return transactionRepository.findAllActiveSymbols();
    }
}
