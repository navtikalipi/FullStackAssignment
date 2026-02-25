package com.tnc.domain.holdings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoldingRowDTO {
    private String symbol;
    private int quantity;
    private BigDecimal averageBuyPrice;
    private BigDecimal currentPrice;
    private BigDecimal investmentAmount;  // quantity * averageBuyPrice
    private BigDecimal currentValue;      // quantity * currentPrice
    private BigDecimal gainLoss;          // currentValue - investmentAmount
    private BigDecimal gainLossPercent;   // (gainLoss / investmentAmount) * 100
    private String status;                // PROFIT, LOSS, NEUTRAL
}
