package com.tnc.domain.portfolio.service;

import com.tnc.common.exception.ResourceNotFoundException;
import com.tnc.domain.portfolio.dto.AnalyticsDTO;
import com.tnc.domain.portfolio.entity.Portfolio;
import com.tnc.domain.portfolio.repository.PortfolioRepository;
import com.tnc.domain.stock.entity.Stock;
import com.tnc.domain.stock.repository.StockRepository;
import com.tnc.domain.transaction.entity.Transaction;
import com.tnc.domain.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final PortfolioRepository portfolioRepository;
    private final StockRepository stockRepository;
    private final TransactionRepository transactionRepository;
    @Transactional(readOnly = true)
    public AnalyticsDTO.DashboardData getDashboardSummary(Long userId, Long portfolioId) {
        
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        List<Stock> stocks = stockRepository.findByPortfolioId(portfolioId);
        List<Stock> activeHoldings = stocks.stream()
                .filter(stock -> stock.getTotalQuantity() != null && stock.getTotalQuantity() > 0)
                .collect(Collectors.toList());
        List<Transaction> transactions = transactionRepository.findByPortfolioId(portfolioId);

        BigDecimal totalInvested = portfolio.getTotalInvested();
        BigDecimal currentValue = activeHoldings.stream()
                .map(stock -> safeValue(stock.getCurrentPrice()).multiply(BigDecimal.valueOf(stock.getTotalQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalGainLoss = currentValue.subtract(totalInvested);
        BigDecimal totalGainLossPercent = BigDecimal.ZERO;
        
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            totalGainLossPercent = totalGainLoss
                    .multiply(new BigDecimal(100))
                    .divide(totalInvested, 2, RoundingMode.HALF_UP);
        }

        List<AnalyticsDTO.HoldingSummary> holdings = activeHoldings.stream()
                .map(this::toHoldingSummary)
                .sorted(Comparator.comparing(AnalyticsDTO.HoldingSummary::getSymbol))
                .collect(Collectors.toList());

        int profitableStocks = (int) holdings.stream()
                .filter(holding -> holding.getGainLoss().compareTo(BigDecimal.ZERO) > 0)
                .count();
        int lossStocks = (int) holdings.stream()
                .filter(holding -> holding.getGainLoss().compareTo(BigDecimal.ZERO) < 0)
                .count();

        List<AnalyticsDTO.TopMover> topGainers = activeHoldings.stream()
                .map(this::toTopMover)
                .filter(mover -> mover.getChangePercent().compareTo(BigDecimal.ZERO) > 0)
                .sorted(Comparator.comparing(AnalyticsDTO.TopMover::getChangePercent).reversed())
                .limit(5)
                .collect(Collectors.toList());

        List<AnalyticsDTO.TopMover> topLosers = activeHoldings.stream()
                .map(this::toTopMover)
                .filter(mover -> mover.getChangePercent().compareTo(BigDecimal.ZERO) < 0)
                .sorted(Comparator.comparing(AnalyticsDTO.TopMover::getChangePercent))
                .limit(5)
                .collect(Collectors.toList());

        List<AnalyticsDTO.TransactionSummary> recentTransactions = transactions.stream()
                .sorted(Comparator
                        .comparing(Transaction::getTransactionDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Transaction::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10)
                .map(this::toTransactionSummary)
                .collect(Collectors.toCollection(ArrayList::new));

        String status = "NEUTRAL";
        if (totalGainLoss.compareTo(BigDecimal.ZERO) > 0) {
            status = "PROFIT";
        } else if (totalGainLoss.compareTo(BigDecimal.ZERO) < 0) {
            status = "LOSS";
        }

        return AnalyticsDTO.DashboardData.builder()
                .portfolioId(portfolioId)
                .portfolioName(portfolio.getPortfolioName())
                .totalInvested(totalInvested)
                .currentValue(currentValue)
                .totalGainLoss(totalGainLoss)
                .totalGainLossPercent(totalGainLossPercent)
                .totalStocks(holdings.size())
                .profitableStocks(profitableStocks)
                .lossStocks(lossStocks)
                .status(status)
                .topGainers(topGainers)
                .topLosers(topLosers)
                .recentTransactions(recentTransactions)
                .holdings(holdings)
                .build();
    }

    @Transactional(readOnly = true)
    public AnalyticsDTO.ProfitLossReport getProfitLossReport(Long userId, Long portfolioId, 
            LocalDate startDate, LocalDate endDate) {
        
        portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        List<Transaction> transactions = transactionRepository
                .findByPortfolioIdAndTransactionDateBetween(portfolioId, startDate, endDate);

        BigDecimal totalBuyValue = transactions.stream()
                .filter(t -> t.getTransactionType() == Transaction.TransactionType.BUY)
                .map(Transaction::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSellValue = transactions.stream()
                .filter(t -> t.getTransactionType() == Transaction.TransactionType.SELL)
                .map(Transaction::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal realizedProfitLoss = totalSellValue.subtract(totalBuyValue);

        Map<LocalDate, BigDecimal> dailyPnL = new LinkedHashMap<>();
        LocalDate loopDate = startDate;
        while (!loopDate.isAfter(endDate)) {
            final LocalDate date = loopDate;
            BigDecimal dayBuy = transactions.stream()
                    .filter(t -> t.getTransactionType() == Transaction.TransactionType.BUY 
                            && t.getTransactionDate().equals(date))
                    .map(Transaction::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal daySell = transactions.stream()
                    .filter(t -> t.getTransactionType() == Transaction.TransactionType.SELL 
                            && t.getTransactionDate().equals(date))
                    .map(Transaction::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            dailyPnL.put(loopDate, daySell.subtract(dayBuy));
            loopDate = loopDate.plusDays(1);
        }

        return AnalyticsDTO.ProfitLossReport.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalBuyValue(totalBuyValue)
                .totalSellValue(totalSellValue)
                .realizedProfitLoss(realizedProfitLoss)
                .dailyPnL(dailyPnL)
                .transactionCount(transactions.size())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AnalyticsDTO.StockPerformance> getStockPerformance(Long userId, Long portfolioId) {
        
        portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        return stockRepository.findByPortfolioId(portfolioId).stream()
                .map(this::toStockPerformance)
                .sorted(Comparator.comparing(AnalyticsDTO.StockPerformance::getProfitLossPercentage).reversed())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AnalyticsDTO.SectorAnalysis getSectorAnalysis(Long userId, Long portfolioId) {
        
        portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        List<Stock> stocks = stockRepository.findByPortfolioId(portfolioId);
        
        Map<String, BigDecimal> sectorValues = new HashMap<>();
        BigDecimal totalValue = BigDecimal.ZERO;

        for (Stock stock : stocks) {
            String sector = stock.getSector() != null ? stock.getSector() : "Uncategorized";
            BigDecimal value = stock.getCurrentValue();
            sectorValues.merge(sector, value, BigDecimal::add);
            totalValue = totalValue.add(value);
        }

        Map<String, BigDecimal> sectorPercentages = new HashMap<>();
        for (Map.Entry<String, BigDecimal> entry : sectorValues.entrySet()) {
            BigDecimal percentage = totalValue.compareTo(BigDecimal.ZERO) > 0
                    ? entry.getValue().multiply(new BigDecimal(100)).divide(totalValue, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            sectorPercentages.put(entry.getKey(), percentage);
        }

        return AnalyticsDTO.SectorAnalysis.builder()
                .sectorValues(sectorValues)
                .sectorPercentages(sectorPercentages)
                .totalValue(totalValue)
                .build();
    }

    private BigDecimal calculateRealizedGain(Long portfolioId) {
                List<Transaction> transactions = transactionRepository.findByPortfolioId(portfolioId).stream()
                                .sorted(Comparator
                                                .comparing(Transaction::getTransactionDate, Comparator.nullsLast(Comparator.naturalOrder()))
                                                .thenComparing(Transaction::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                                .collect(Collectors.toList());

                Map<Long, Integer> quantityByStock = new HashMap<>();
                Map<Long, BigDecimal> averageCostByStock = new HashMap<>();
                BigDecimal realizedGain = BigDecimal.ZERO;

                for (Transaction transaction : transactions) {
                        Long stockId = transaction.getStock().getId();
                        Integer existingQuantity = quantityByStock.getOrDefault(stockId, 0);
                        BigDecimal existingAverageCost = averageCostByStock.getOrDefault(stockId, BigDecimal.ZERO);
                        BigDecimal unitPrice = safeValue(transaction.getPrice());

                        if (transaction.getTransactionType() == Transaction.TransactionType.BUY) {
                                int newQuantity = existingQuantity + transaction.getQuantity();
                                BigDecimal totalCost = existingAverageCost.multiply(BigDecimal.valueOf(existingQuantity))
                                                .add(unitPrice.multiply(BigDecimal.valueOf(transaction.getQuantity())));
                                BigDecimal newAverageCost = newQuantity > 0
                                                ? totalCost.divide(BigDecimal.valueOf(newQuantity), 4, RoundingMode.HALF_UP)
                                                : BigDecimal.ZERO;
                                quantityByStock.put(stockId, newQuantity);
                                averageCostByStock.put(stockId, newAverageCost);
                        } else {
                                int sellQuantity = transaction.getQuantity();
                                if (sellQuantity > existingQuantity) {
                                        continue;
                                }
                                BigDecimal gainPerShare = unitPrice.subtract(existingAverageCost);
                                realizedGain = realizedGain.add(gainPerShare.multiply(BigDecimal.valueOf(sellQuantity)));
                                int newQuantity = existingQuantity - sellQuantity;
                                quantityByStock.put(stockId, newQuantity);
                                if (newQuantity == 0) {
                                        averageCostByStock.put(stockId, BigDecimal.ZERO);
                                }
                        }
                }

                return realizedGain.setScale(2, RoundingMode.HALF_UP);
    }

    private Map<String, BigDecimal> calculateSectorAllocation(List<Stock> stocks) {
        BigDecimal totalValue = stocks.stream()
                .map(Stock::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> sectorAllocation = new HashMap<>();
        
        for (Stock stock : stocks) {
            String sector = stock.getSector() != null ? stock.getSector() : "Other";
            BigDecimal percentage = totalValue.compareTo(BigDecimal.ZERO) > 0
                    ? stock.getCurrentValue().multiply(new BigDecimal(100)).divide(totalValue, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            sectorAllocation.merge(sector, percentage, BigDecimal::add);
        }

        return sectorAllocation;
    }

        private AnalyticsDTO.HoldingSummary toHoldingSummary(Stock stock) {
                BigDecimal currentPrice = safeValue(stock.getCurrentPrice());
                BigDecimal investmentAmount = safeValue(stock.getTotalInvested());
                BigDecimal currentValue = currentPrice.multiply(BigDecimal.valueOf(stock.getTotalQuantity()));
                BigDecimal gainLoss = currentValue.subtract(investmentAmount);
                BigDecimal gainLossPercent = BigDecimal.ZERO;

                if (investmentAmount.compareTo(BigDecimal.ZERO) > 0) {
                        gainLossPercent = gainLoss.multiply(BigDecimal.valueOf(100))
                                        .divide(investmentAmount, 2, RoundingMode.HALF_UP);
                }

                String status = "NEUTRAL";
                if (gainLoss.compareTo(BigDecimal.ZERO) > 0) {
                        status = "PROFIT";
                } else if (gainLoss.compareTo(BigDecimal.ZERO) < 0) {
                        status = "LOSS";
                }

                return AnalyticsDTO.HoldingSummary.builder()
                                .stockId(stock.getId())
                                .symbol(stock.getSymbol())
                                .companyName(stock.getCompanyName())
                                .quantity(stock.getTotalQuantity())
                                .averageBuyPrice(safeValue(stock.getAverageBuyPrice()))
                                .currentPrice(currentPrice)
                                .investmentAmount(investmentAmount)
                                .currentValue(currentValue)
                                .gainLoss(gainLoss)
                                .gainLossPercent(gainLossPercent)
                                .status(status)
                                .build();
        }

        private AnalyticsDTO.TopMover toTopMover(Stock stock) {
                BigDecimal change = safeValue(stock.getProfitLoss());
                BigDecimal changePercent = safeValue(stock.getProfitLossPercentage());
                return AnalyticsDTO.TopMover.builder()
                                .symbol(stock.getSymbol())
                                .companyName(stock.getCompanyName())
                                .currentPrice(safeValue(stock.getCurrentPrice()))
                                .change(change)
                                .changePercent(changePercent)
                                .build();
        }

        private AnalyticsDTO.TransactionSummary toTransactionSummary(Transaction transaction) {
                return AnalyticsDTO.TransactionSummary.builder()
                                .id(transaction.getId())
                                .symbol(transaction.getStock().getSymbol())
                                .transactionType(transaction.getTransactionType().name())
                                .quantity(transaction.getQuantity())
                                .price(safeValue(transaction.getPrice()))
                                .totalAmount(safeValue(transaction.getTotalAmount()))
                                .transactionDate(transaction.getTransactionDate())
                                .build();
        }

        private BigDecimal safeValue(BigDecimal value) {
                return value == null ? BigDecimal.ZERO : value;
        }

    private AnalyticsDTO.StockPerformance toStockPerformance(Stock stock) {
        return AnalyticsDTO.StockPerformance.builder()
                .stockId(stock.getId())
                .symbol(stock.getSymbol())
                .companyName(stock.getCompanyName())
                .quantity(stock.getTotalQuantity())
                .averageBuyPrice(stock.getAverageBuyPrice())
                .currentPrice(stock.getCurrentPrice())
                .totalInvested(stock.getTotalInvested())
                .currentValue(stock.getCurrentValue())
                .profitLoss(stock.getProfitLoss())
                .profitLossPercentage(stock.getProfitLossPercentage())
                .build();
    }
}
