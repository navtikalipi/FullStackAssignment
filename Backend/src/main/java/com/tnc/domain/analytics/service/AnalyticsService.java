package com.tnc.domain.analytics.service;

import com.tnc.domain.analytics.dto.AllocationDTO;
import com.tnc.domain.analytics.dto.ProfitLossSummaryDTO;
import com.tnc.domain.analytics.dto.TimeSeriesPointDTO;
import com.tnc.domain.analytics.dto.TopMoversDTO;
import com.tnc.domain.analytics.util.AnalyticsCalculator;
import com.tnc.domain.holdings.dto.HoldingRowDTO;
import com.tnc.domain.holdings.service.HoldingsService;
import com.tnc.domain.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AnalyticsService {

    private final HoldingsService holdingsService;
    private final ProfitLossService profitLossService;
    private final PerformanceService performanceService;
    private final TransactionRepository transactionRepository;

    /**
     * Get top gaining stocks
     */
    public List<TopMoversDTO> getTopGainers(int limit) {
        var holdings = holdingsService.getAllHoldings().getHoldings();
        return AnalyticsCalculator.getTopGainers(holdings, limit);
    }

    /**
     * Get top losing stocks
     */
    public List<TopMoversDTO> getTopLosers(int limit) {
        var holdings = holdingsService.getAllHoldings().getHoldings();
        return AnalyticsCalculator.getTopLosers(holdings, limit);
    }

    /**
     * Get portfolio allocation
     */
    public List<AllocationDTO> getPortfolioAllocation() {
        var holdings = holdingsService.getAllHoldings().getHoldings();
        return AnalyticsCalculator.calculateAllocation(holdings);
    }

    /**
     * Get profit/loss summary
     */
    public ProfitLossSummaryDTO getProfitLossSummary() {
        var holdingsSummary = holdingsService.getAllHoldings();
        var transactions = transactionRepository.findAll();

        return profitLossService.calculateSummary(
                transactions,
                holdingsSummary.getTotalCurrentValue(),
                holdingsSummary.getTotalInvested()
        );
    }

    /**
     * Get daily performance
     */
    public List<TimeSeriesPointDTO> getDailyPerformance(int days) {
        return performanceService.getDailyPerformance(days);
    }

    /**
     * Get monthly performance
     */
    public List<TimeSeriesPointDTO> getMonthlyPerformance(int months) {
        return performanceService.getMonthlyPerformance(months);
    }

    /**
     * Get yearly performance
     */
    public List<TimeSeriesPointDTO> getYearlyPerformance(int years) {
        return performanceService.getYearlyPerformance(years);
    }
}
