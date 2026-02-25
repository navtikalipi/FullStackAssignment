package com.tnc.domain.transaction.service;

import com.tnc.common.exception.BadRequestException;
import com.tnc.domain.transaction.dto.TransactionCreateRequest;
import com.tnc.domain.transaction.dto.TransactionUpdateRequest;
import org.springframework.stereotype.Service;

@Service
public class TransactionValidationService {

    public void validateCreateRequest(TransactionCreateRequest request) {
        if (request == null) {
            throw new BadRequestException("Transaction request cannot be null");
        }
        if (request.getSymbol() == null || request.getSymbol().trim().isEmpty()) {
            throw new BadRequestException("Stock symbol is required");
        }
        if (request.getType() == null) {
            throw new BadRequestException("Transaction type (BUY/SELL) is required");
        }
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }
        if (request.getPrice() == null || request.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Price must be greater than 0");
        }
        if (request.getTransactionDate() == null) {
            throw new BadRequestException("Transaction date is required");
        }
    }

    public void validateUpdateRequest(TransactionUpdateRequest request) {
        validateCreateRequest(new TransactionCreateRequest(
                request.getSymbol(),
                request.getType(),
                request.getQuantity(),
                request.getPrice(),
                request.getTransactionDate(),
                request.getSellPrice(),
                request.getNotes()
        ));
    }
}
