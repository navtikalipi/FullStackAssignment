package com.tnc.domain.holdings.service;

import com.tnc.domain.transaction.entity.Transaction;
import com.tnc.domain.transaction.entity.TransactionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HoldingsComputationService {

    /**
     * Calculate average buy price for a symbol
     */
    public BigDecimal calculateAverageBuyPrice(List<Transaction> transactions) {
        if (transactions.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalCost = BigDecimal.ZERO;
        int totalQuantity = 0;

        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.BUY) {
                totalCost = totalCost.add(t.getPrice().multiply(new BigDecimal(t.getQuantity())));
                totalQuantity += t.getQuantity();
            }
        }

        if (totalQuantity == 0) {
            return BigDecimal.ZERO;
        }

        return totalCost.divide(new BigDecimal(totalQuantity), 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate current quantity held
     */
    public int calculateCurrentQuantity(List<Transaction> transactions) {
        int quantity = 0;
        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.BUY) {
                quantity += t.getQuantity();
            } else if (t.getType() == TransactionType.SELL) {
                quantity -= t.getQuantity();
            }
        }
        return Math.max(quantity, 0);
    }

    /**
     * Calculate realized gains (from completed sells)
     */
    public BigDecimal calculateRealizedGains(List<Transaction> transactions) {
        BigDecimal realizedGains = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.SELL && t.getSellPrice() != null) {
                BigDecimal cost = t.getPrice().multiply(new BigDecimal(t.getQuantity()));
                BigDecimal revenue = t.getSellPrice().multiply(new BigDecimal(t.getQuantity()));
                realizedGains = realizedGains.add(revenue.subtract(cost));
            }
        }

        return realizedGains;
    }
}
