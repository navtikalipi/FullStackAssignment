package com.tnc.domain.analytics.service;

import com.tnc.domain.analytics.dto.ProfitLossSummaryDTO;
import com.tnc.domain.transaction.entity.Transaction;
import com.tnc.domain.transaction.entity.TransactionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfitLossService {

    /**
     * Calculate profit/loss summary
     */
    public ProfitLossSummaryDTO calculateSummary(List<Transaction> transactions, BigDecimal currentPortfolioValue, BigDecimal totalInvestment) {
        BigDecimal realizedProfit = BigDecimal.ZERO;
        BigDecimal realizedLoss = BigDecimal.ZERO;

        // Calculate realized gains/losses from sell transactions
        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.SELL && t.getSellPrice() != null) {
                BigDecimal cost = t.getPrice().multiply(new BigDecimal(t.getQuantity()));
                BigDecimal revenue = t.getSellPrice().multiply(new BigDecimal(t.getQuantity()));
                BigDecimal gain = revenue.subtract(cost);

                if (gain.compareTo(BigDecimal.ZERO) > 0) {
                    realizedProfit = realizedProfit.add(gain);
                } else {
                    realizedLoss = realizedLoss.add(gain.abs());
                }
            }
        }

        // Calculate unrealized gains/losses
        BigDecimal unrealizedGainLoss = currentPortfolioValue.subtract(totalInvestment);
        BigDecimal unrealizedProfit = BigDecimal.ZERO;
        BigDecimal unrealizedLoss = BigDecimal.ZERO;

        if (unrealizedGainLoss.compareTo(BigDecimal.ZERO) > 0) {
            unrealizedProfit = unrealizedGainLoss;
        } else {
            unrealizedLoss = unrealizedGainLoss.abs();
        }

        BigDecimal totalProfit = realizedProfit.add(unrealizedProfit);
        BigDecimal totalLoss = realizedLoss.add(unrealizedLoss);
        BigDecimal netProfit = totalProfit.subtract(totalLoss);

        BigDecimal netProfitPercent = BigDecimal.ZERO;
        if (totalInvestment.compareTo(BigDecimal.ZERO) > 0) {
            netProfitPercent = netProfit.divide(totalInvestment, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return ProfitLossSummaryDTO.builder()
                .realizedProfit(realizedProfit)
                .unrealizedProfit(unrealizedProfit)
                .totalProfit(totalProfit)
                .realizedLoss(realizedLoss)
                .unrealizedLoss(unrealizedLoss)
                .totalLoss(totalLoss)
                .netProfit(netProfit)
                .netProfitPercent(netProfitPercent)
                .build();
    }
}
