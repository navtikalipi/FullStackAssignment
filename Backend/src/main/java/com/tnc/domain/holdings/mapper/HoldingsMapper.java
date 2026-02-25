package com.tnc.domain.holdings.mapper;

import com.tnc.domain.holdings.dto.HoldingRowDTO;
import com.tnc.domain.holdings.dto.HoldingsSummaryDTO;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class HoldingsMapper {

    public HoldingRowDTO toHoldingRowDTO(String symbol, int quantity, BigDecimal averageBuyPrice, BigDecimal currentPrice) {
        BigDecimal investmentAmount = averageBuyPrice.multiply(new BigDecimal(quantity));
        BigDecimal currentValue = currentPrice.multiply(new BigDecimal(quantity));
        BigDecimal gainLoss = currentValue.subtract(investmentAmount);
        
        BigDecimal gainLossPercent = BigDecimal.ZERO;
        if (investmentAmount.compareTo(BigDecimal.ZERO) > 0) {
            gainLossPercent = gainLoss.divide(investmentAmount, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        String status = "NEUTRAL";
        if (gainLoss.compareTo(BigDecimal.ZERO) > 0) {
            status = "PROFIT";
        } else if (gainLoss.compareTo(BigDecimal.ZERO) < 0) {
            status = "LOSS";
        }

        return HoldingRowDTO.builder()
                .symbol(symbol)
                .quantity(quantity)
                .averageBuyPrice(averageBuyPrice)
                .currentPrice(currentPrice)
                .investmentAmount(investmentAmount)
                .currentValue(currentValue)
                .gainLoss(gainLoss)
                .gainLossPercent(gainLossPercent)
                .status(status)
                .build();
    }

    public HoldingsSummaryDTO toHoldingsSummaryDTO(List<HoldingRowDTO> holdings) {
        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal totalCurrentValue = BigDecimal.ZERO;
        int profitableCount = 0;
        int lossCount = 0;

        for (HoldingRowDTO holding : holdings) {
            totalInvested = totalInvested.add(holding.getInvestmentAmount());
            totalCurrentValue = totalCurrentValue.add(holding.getCurrentValue());
            
            if ("PROFIT".equals(holding.getStatus())) {
                profitableCount++;
            } else if ("LOSS".equals(holding.getStatus())) {
                lossCount++;
            }
        }

        BigDecimal totalGainLoss = totalCurrentValue.subtract(totalInvested);
        BigDecimal totalGainLossPercent = BigDecimal.ZERO;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            totalGainLossPercent = totalGainLoss.divide(totalInvested, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        return HoldingsSummaryDTO.builder()
                .holdings(holdings)
                .totalStocksHeld(holdings.size())
                .totalInvested(totalInvested)
                .totalCurrentValue(totalCurrentValue)
                .totalGainLoss(totalGainLoss)
                .totalGainLossPercent(totalGainLossPercent)
                .profitableCount(profitableCount)
                .lossCount(lossCount)
                .build();
    }
}
