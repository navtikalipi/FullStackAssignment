package com.tnc.service;

import com.tnc.domain.transaction.entity.Transaction;
import com.tnc.domain.user.entity.User;
import com.tnc.repository.TransactionRepository;
import com.tnc.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionsService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Transaction> getAllTransactions(String username, String type, Integer limit, Integer offset) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return List.of();
        }
        
        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());
        
        // Filter by type if provided
        if (type != null && !type.isEmpty()) {
            transactions = transactions.stream()
                    .filter(t -> t.getType().equalsIgnoreCase(type))
                    .toList();
        }
        
        // Apply pagination
        int start = offset != null ? offset : 0;
        int end = limit != null ? Math.min(start + limit, transactions.size()) : transactions.size();
        
        if (start >= transactions.size()) {
            return List.of();
        }
        
        return transactions.subList(start, end);
    }

    public Optional<Transaction> getTransactionById(Long id, String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return Optional.empty();
        }
        return transactionRepository.findById(id);
    }

    public Transaction createTransaction(Transaction transaction, String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        transaction.setUser(user);
        
        // Set transaction date if not provided
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(new Date());
        }
        
        return transactionRepository.save(transaction);
    }
}
