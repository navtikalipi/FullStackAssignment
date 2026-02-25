package com.tnc.domain.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfitLossSummaryDTO {
    private BigDecimal realizedProfit;
    private BigDecimal unrealizedProfit;
    private BigDecimal totalProfit;
    private BigDecimal realizedLoss;
    private BigDecimal unrealizedLoss;
    private BigDecimal totalLoss;
    private BigDecimal netProfit;
    private BigDecimal netProfitPercent;
}
