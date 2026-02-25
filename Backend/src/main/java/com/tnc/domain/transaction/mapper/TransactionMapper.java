package com.tnc.domain.transaction.mapper;

import com.tnc.domain.transaction.dto.TransactionCreateRequest;
import com.tnc.domain.transaction.dto.TransactionResponse;
import com.tnc.domain.transaction.dto.TransactionUpdateRequest;
import com.tnc.domain.transaction.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public Transaction toEntity(TransactionCreateRequest request) {
        if (request == null) {
            return null;
        }
        Transaction transaction = new Transaction();
        transaction.setSymbol(request.getSymbol());
        transaction.setType(request.getType());
        transaction.setQuantity(request.getQuantity());
        transaction.setPrice(request.getPrice());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setSellPrice(request.getSellPrice());
        transaction.setNotes(request.getNotes());
        return transaction;
    }

    public void updateEntity(TransactionUpdateRequest request, Transaction transaction) {
        if (request == null) {
            return;
        }
        transaction.setSymbol(request.getSymbol());
        transaction.setType(request.getType());
        transaction.setQuantity(request.getQuantity());
        transaction.setPrice(request.getPrice());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setSellPrice(request.getSellPrice());
        transaction.setNotes(request.getNotes());
    }

    public TransactionResponse toResponse(Transaction transaction) {
        if (transaction == null) {
            return null;
        }
        TransactionResponse response = new TransactionResponse();
        response.setId(transaction.getId());
        response.setSymbol(transaction.getSymbol());
        response.setType(transaction.getType());
        response.setQuantity(transaction.getQuantity());
        response.setPrice(transaction.getPrice());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setSellPrice(transaction.getSellPrice());
        response.setNotes(transaction.getNotes());
        response.setCreatedAt(transaction.getCreatedAt());
        response.setUpdatedAt(transaction.getUpdatedAt());
        return response;
    }
}
