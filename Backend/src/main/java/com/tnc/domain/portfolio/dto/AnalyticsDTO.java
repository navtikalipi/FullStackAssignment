package com.tnc.domain.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class AnalyticsDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardData {
        private Long portfolioId;
        private String portfolioName;
        private BigDecimal totalInvested;
        private BigDecimal currentValue;
        private BigDecimal totalGainLoss;
        private BigDecimal totalGainLossPercent;
        private Integer totalStocks;
        private Integer profitableStocks;
        private Integer lossStocks;
        private String status;
        private List<TopMover> topGainers;
        private List<TopMover> topLosers;
        private List<TransactionSummary> recentTransactions;
        private List<HoldingSummary> holdings;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopMover {
        private String symbol;
        private String companyName;
        private BigDecimal currentPrice;
        private BigDecimal change;
        private BigDecimal changePercent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HoldingSummary {
        private Long stockId;
        private String symbol;
        private String companyName;
        private Integer quantity;
        private BigDecimal averageBuyPrice;
        private BigDecimal currentPrice;
        private BigDecimal investmentAmount;
        private BigDecimal currentValue;
        private BigDecimal gainLoss;
        private BigDecimal gainLossPercent;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionSummary {
        private Long id;
        private String symbol;
        private String transactionType;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal totalAmount;
        private LocalDate transactionDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockPerformance {
        private Long stockId;
        private String symbol;
        private String companyName;
        private Integer quantity;
        private BigDecimal averageBuyPrice;
        private BigDecimal currentPrice;
        private BigDecimal totalInvested;
        private BigDecimal currentValue;
        private BigDecimal profitLoss;
        private BigDecimal profitLossPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfitLossReport {
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal totalBuyValue;
        private BigDecimal totalSellValue;
        private BigDecimal realizedProfitLoss;
        private Map<LocalDate, BigDecimal> dailyPnL;
        private Integer transactionCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectorAnalysis {
        private Map<String, BigDecimal> sectorValues;
        private Map<String, BigDecimal> sectorPercentages;
        private BigDecimal totalValue;
    }
}
