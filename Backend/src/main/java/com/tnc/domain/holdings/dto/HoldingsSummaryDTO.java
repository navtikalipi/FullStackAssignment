package com.tnc.domain.holdings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoldingsSummaryDTO {
    private List<HoldingRowDTO> holdings;
    private int totalStocksHeld;
    private BigDecimal totalInvested;
    private BigDecimal totalCurrentValue;
    private BigDecimal totalGainLoss;
    private BigDecimal totalGainLossPercent;
    private int profitableCount;
    private int lossCount;
}
