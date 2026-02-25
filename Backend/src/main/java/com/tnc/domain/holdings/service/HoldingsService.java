package com.tnc.domain.holdings.service;

import com.tnc.domain.holdings.dto.HoldingRowDTO;
import com.tnc.domain.holdings.dto.HoldingsSummaryDTO;
import com.tnc.domain.holdings.mapper.HoldingsMapper;
import com.tnc.domain.marketdata.service.MarketDataService;
import com.tnc.domain.transaction.entity.Transaction;
import com.tnc.domain.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class HoldingsService {

    private final TransactionRepository transactionRepository;
    private final HoldingsMapper holdingsMapper;
    private final HoldingsComputationService computationService;
    private final MarketDataService marketDataService;

    /**
     * Get all current holdings with latest prices
     */
    public HoldingsSummaryDTO getAllHoldings() {
        List<String> symbols = transactionRepository.findAllActiveSymbols();
        List<HoldingRowDTO> holdings = new ArrayList<>();

        for (String symbol : symbols) {
            List<Transaction> transactions = transactionRepository.findActiveTransactionsBySymbol(symbol);
            
            int currentQty = computationService.calculateCurrentQuantity(transactions);
            if (currentQty <= 0) continue;  // Skip if no holdings

            BigDecimal avgBuyPrice = computationService.calculateAverageBuyPrice(transactions);
            BigDecimal currentPrice = getLatestPrice(symbol);

            HoldingRowDTO holding = holdingsMapper.toHoldingRowDTO(symbol, currentQty, avgBuyPrice, currentPrice);
            holdings.add(holding);
        }

        return holdingsMapper.toHoldingsSummaryDTO(holdings);
    }

    /**
     * Get holdings for a specific symbol
     */
    public HoldingRowDTO getHoldingBySymbol(String symbol) {
        List<Transaction> transactions = transactionRepository.findActiveTransactionsBySymbol(symbol);
        
        int currentQty = computationService.calculateCurrentQuantity(transactions);
        BigDecimal avgBuyPrice = computationService.calculateAverageBuyPrice(transactions);
        BigDecimal currentPrice = getLatestPrice(symbol);

        return holdingsMapper.toHoldingRowDTO(symbol, currentQty, avgBuyPrice, currentPrice);
    }

    private BigDecimal getLatestPrice(String symbol) {
        var quote = marketDataService.getPrice(symbol);
        return quote != null ? quote.getPrice() : BigDecimal.ZERO;
    }
}
