package com.tnc.domain.transaction.service;

import com.tnc.common.exception.BadRequestException;
import com.tnc.common.exception.ResourceNotFoundException;
import com.tnc.domain.portfolio.entity.Portfolio;
import com.tnc.domain.portfolio.repository.PortfolioRepository;
import com.tnc.domain.portfolio.service.MarketDataService;
import com.tnc.domain.stock.dto.StockDTO;
import com.tnc.domain.stock.entity.Stock;
import com.tnc.domain.stock.repository.StockRepository;
import com.tnc.domain.transaction.dto.TransactionDTO;
import com.tnc.domain.transaction.entity.Transaction;
import com.tnc.domain.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PortfolioRepository portfolioRepository;
    private final StockRepository stockRepository;
    private final MarketDataService marketDataService;

    @Transactional
    public TransactionDTO.TransactionResponse createTransaction(Long userId, Long portfolioId, 
            TransactionDTO.TransactionRequest request) {
        
        // Validate portfolio ownership
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        validateTransactionRequest(request);

        // Get or create stock
        Stock stock = getOrCreateStock(portfolio, request.getSymbol(), request.getTransactionType());

        // Validate sell transaction has sufficient quantity
        if (request.getTransactionType() == Transaction.TransactionType.SELL) {
            validateSufficientQuantity(stock, request.getQuantity());
        }

        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setPortfolio(portfolio);
        transaction.setStock(stock);
        transaction.setTransactionType(request.getTransactionType());
        transaction.setQuantity(request.getQuantity());
        transaction.setPrice(request.getPrice());
        transaction.setBrokerage(request.getBrokerage() != null ? request.getBrokerage() : BigDecimal.ZERO);
        transaction.setTax(request.getTax() != null ? request.getTax() : BigDecimal.ZERO);
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setNotes(request.getNotes());
        transaction.setIsRealized(false);

        transaction = transactionRepository.save(transaction);

        // Update stock holdings
        recalculateStockHoldings(stock.getId());

        // Update portfolio totals
        updatePortfolioTotals(portfolio);

        return mapToResponse(transaction, stock);
    }

    @Transactional(readOnly = true)
    public List<TransactionDTO.TransactionResponse> getPortfolioTransactions(Long userId, 
            Long portfolioId, Pageable pageable) {
        
        portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        return transactionRepository.findByPortfolioId(portfolioId, pageable).stream()
            .map(this::mapToResponseWithStock)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionDTO.TransactionResponse> getStockTransactions(Long userId, 
            Long portfolioId, Long stockId) {
        
        portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        return transactionRepository.findByStockId(stockId).stream()
                .map(this::mapToResponseWithStock)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TransactionDTO.TransactionResponse getTransaction(Long userId, Long portfolioId, Long transactionId) {
        
        portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        return mapToResponseWithStock(transaction);
    }

    @Transactional
    public TransactionDTO.TransactionResponse updateTransaction(Long userId, Long portfolioId, 
            Long transactionId, TransactionDTO.TransactionUpdateRequest request) {
        
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        ensureTransactionBelongsToPortfolio(transaction, portfolioId);

        if (request.getQuantity() != null) {
            if (request.getQuantity() <= 0) {
                throw new BadRequestException("Quantity must be greater than zero");
            }
            transaction.setQuantity(request.getQuantity());
        }
        if (request.getPrice() != null) {
            if (request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Price must be greater than zero");
            }
            transaction.setPrice(request.getPrice());
        }
        if (request.getBrokerage() != null) {
            transaction.setBrokerage(request.getBrokerage());
        }
        if (request.getTax() != null) {
            transaction.setTax(request.getTax());
        }
        if (request.getTransactionDate() != null) {
            transaction.setTransactionDate(request.getTransactionDate());
        }
        if (request.getNotes() != null) {
            transaction.setNotes(request.getNotes());
        }

        transaction = transactionRepository.save(transaction);

        recalculateStockHoldings(transaction.getStock().getId());
        updatePortfolioTotals(portfolio);

        return mapToResponseWithStock(transaction);
    }

    @Transactional
    public void deleteTransaction(Long userId, Long portfolioId, Long transactionId) {
        
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        ensureTransactionBelongsToPortfolio(transaction, portfolioId);
        Long stockId = transaction.getStock().getId();
        
        transactionRepository.delete(transaction);

        recalculateStockHoldings(stockId);
        updatePortfolioTotals(portfolio);
    }

    private Stock getOrCreateStock(Portfolio portfolio, String symbol, Transaction.TransactionType transactionType) {
        String normalizedSymbol = symbol.trim().toUpperCase();
        return stockRepository.findByPortfolioIdAndSymbol(portfolio.getId(), normalizedSymbol)
                .orElseGet(() -> {
                    if (transactionType == Transaction.TransactionType.SELL) {
                        throw new BadRequestException("Cannot sell stock that does not exist in portfolio");
                    }

                    Stock newStock = new Stock();
                    newStock.setSymbol(normalizedSymbol);
                    newStock.setCompanyName(marketDataService.getStockName(normalizedSymbol));
                    newStock.setPortfolio(portfolio);
                    newStock.setTotalQuantity(0);
                    newStock.setAverageBuyPrice(BigDecimal.ZERO);
                    newStock.setTotalInvested(BigDecimal.ZERO);
                    newStock.setCurrentPrice(marketDataService.getCurrentPrice(normalizedSymbol));
                    newStock.setCurrentValue(BigDecimal.ZERO);
                    newStock.setProfitLoss(BigDecimal.ZERO);
                    newStock.setProfitLossPercentage(BigDecimal.ZERO);
                    return stockRepository.save(newStock);
                });
    }

    private void validateSufficientQuantity(Stock stock, Integer sellQuantity) {
        if (stock.getTotalQuantity() < sellQuantity) {
            throw new BadRequestException("Insufficient stock quantity. Available: " + stock.getTotalQuantity());
        }
    }

    private void recalculateStockHoldings(Long stockId) {
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));

        List<Transaction> transactions = transactionRepository.findByStockIdOrderByTransactionDateAscIdAsc(stockId)
                .stream()
                .sorted(Comparator
                        .comparing(Transaction::getTransactionDate, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Transaction::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());

        int totalQuantity = 0;
        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal averageBuyPrice = BigDecimal.ZERO;

        for (Transaction transaction : transactions) {
            int quantity = transaction.getQuantity();
            BigDecimal price = transaction.getPrice();

            if (transaction.getTransactionType() == Transaction.TransactionType.BUY) {
                BigDecimal transactionCost = price.multiply(BigDecimal.valueOf(quantity));
                totalInvested = totalInvested.add(transactionCost);
                totalQuantity += quantity;
                averageBuyPrice = totalQuantity > 0
                        ? totalInvested.divide(BigDecimal.valueOf(totalQuantity), 4, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;
                transaction.setIsRealized(false);
            } else {
                if (quantity > totalQuantity) {
                    throw new BadRequestException("Sell quantity exceeds available holdings for " + stock.getSymbol());
                }

                BigDecimal costReduction = averageBuyPrice.multiply(BigDecimal.valueOf(quantity));
                totalInvested = totalInvested.subtract(costReduction);
                totalQuantity -= quantity;

                if (totalQuantity == 0) {
                    totalInvested = BigDecimal.ZERO;
                    averageBuyPrice = BigDecimal.ZERO;
                }

                transaction.setIsRealized(true);
            }
        }

        BigDecimal currentPrice = marketDataService.getCurrentPrice(stock.getSymbol());
        BigDecimal currentValue = currentPrice.multiply(BigDecimal.valueOf(totalQuantity));
        BigDecimal profitLoss = currentValue.subtract(totalInvested);
        BigDecimal profitLossPercentage = BigDecimal.ZERO;

        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            profitLossPercentage = profitLoss
                    .multiply(BigDecimal.valueOf(100))
                    .divide(totalInvested, 2, RoundingMode.HALF_UP);
        }

        stock.setTotalQuantity(totalQuantity);
        stock.setAverageBuyPrice(averageBuyPrice.setScale(2, RoundingMode.HALF_UP));
        stock.setTotalInvested(totalInvested.setScale(2, RoundingMode.HALF_UP));
        stock.setCurrentPrice(currentPrice);
        stock.setCurrentValue(currentValue.setScale(2, RoundingMode.HALF_UP));
        stock.setProfitLoss(profitLoss.setScale(2, RoundingMode.HALF_UP));
        stock.setProfitLossPercentage(profitLossPercentage);

        transactionRepository.saveAll(transactions);
        stockRepository.save(stock);
    }

    private void updatePortfolioTotals(Portfolio portfolio) {
        BigDecimal totalInvested = transactionRepository.calculateTotalInvested(portfolio.getId());
        BigDecimal totalSold = transactionRepository.calculateTotalSold(portfolio.getId());
        
        if (totalInvested == null) totalInvested = BigDecimal.ZERO;
        if (totalSold == null) totalSold = BigDecimal.ZERO;
        
        portfolio.setTotalInvested(totalInvested.subtract(totalSold));
        
        // Calculate current value based on holdings
        List<Stock> stocks = stockRepository.findByPortfolioId(portfolio.getId());
        BigDecimal currentValue = stocks.stream()
                .map(Stock::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        portfolio.setCurrentValue(currentValue);
        portfolioRepository.save(portfolio);
    }

    private void validateTransactionRequest(TransactionDTO.TransactionRequest request) {
        if (request.getSymbol() == null || request.getSymbol().trim().isEmpty()) {
            throw new BadRequestException("Symbol is required");
        }
        if (request.getTransactionType() == null) {
            throw new BadRequestException("Transaction type is required");
        }
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }
        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Price must be greater than zero");
        }
        if (request.getTransactionDate() == null) {
            throw new BadRequestException("Transaction date is required");
        }
    }

    private void ensureTransactionBelongsToPortfolio(Transaction transaction, Long portfolioId) {
        if (!transaction.getPortfolio().getId().equals(portfolioId)) {
            throw new ResourceNotFoundException("Transaction not found");
        }
    }

    private TransactionDTO.TransactionResponse mapToResponse(Transaction transaction, Stock stock) {
        return TransactionDTO.TransactionResponse.builder()
                .id(transaction.getId())
                .portfolioId(transaction.getPortfolio().getId())
                .stockId(stock.getId())
                .symbol(stock.getSymbol())
                .companyName(stock.getCompanyName())
                .transactionType(transaction.getTransactionType())
                .quantity(transaction.getQuantity())
                .price(transaction.getPrice())
                .totalAmount(transaction.getTotalAmount())
                .brokerage(transaction.getBrokerage())
                .tax(transaction.getTax())
                .transactionDate(transaction.getTransactionDate())
                .notes(transaction.getNotes())
                .isRealized(transaction.getIsRealized())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private TransactionDTO.TransactionResponse mapToResponseWithStock(Transaction transaction) {
        Stock stock = transaction.getStock();
        return mapToResponse(transaction, stock);
    }
}
