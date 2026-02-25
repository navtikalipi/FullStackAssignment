package com.tnc.domain.dashboard.dto;

import com.tnc.domain.analytics.dto.TopMoversDTO;
import com.tnc.domain.holdings.dto.HoldingRowDTO;
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
public class DashboardDTO {
    // Summary metrics
    private BigDecimal totalInvested;
    private BigDecimal currentPortfolioValue;
    private BigDecimal totalGainLoss;
    private BigDecimal totalGainLossPercent;
    private String gainLossStatus;  // PROFIT, LOSS, NEUTRAL

    // Holdings overview
    private int totalStocksHeld;
    private int profitableStocks;
    private int lossStocks;

    // Top movers
    private List<TopMoversDTO> topGainers;
    private List<TopMoversDTO> topLosers;

    // Recent holdings snapshot
    private List<HoldingRowDTO> topHoldings;
}
