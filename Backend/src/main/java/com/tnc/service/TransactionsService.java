package com.tnc.service;

import com.tnc.domain.holdings.entity.Holding;
import com.tnc.domain.portfolio.entity.Portfolio;
import com.tnc.domain.transaction.entity.Transaction;
import com.tnc.domain.user.entity.User;
import com.tnc.repository.HoldingRepository;
import com.tnc.repository.PortfolioRepository;
import com.tnc.repository.TransactionRepository;
import com.tnc.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionsService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HoldingRepository holdingRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private MarketDataService marketDataService;

    @Autowired
    private PaymentServiceClient paymentServiceClient;

    public List<Transaction> getAllTransactions(String username, String type, Integer limit, Integer offset) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return List.of();
        }
        
        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());
        
        if (type != null && !type.isEmpty()) {
            transactions = transactions.stream()
                    .filter(t -> t.getType().equalsIgnoreCase(type))
                    .toList();
        }
        
        int start = offset != null ? offset : 0;
        int end = limit != null ? Math.min(start + limit, transactions.size()) : transactions.size();
        
        if (start >= transactions.size()) {
            return List.of();
        }
        
        return transactions.subList(start, end);
    }

    public Optional<Transaction> getTransactionById(Long id, String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return Optional.empty();
        }
        return transactionRepository.findById(id);
    }

    @Transactional
    public Transaction createTransaction(Transaction transaction, String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        transaction.setUser(user);
        
        // Set order type default
        if (transaction.getOrderType() == null || transaction.getOrderType().isEmpty()) {
            transaction.setOrderType("MARKET");
        }
        
        // Set status default
        if (transaction.getStatus() == null || transaction.getStatus().isEmpty()) {
            transaction.setStatus("EXECUTED");
        }
        
        // Handle different order types
        String orderType = transaction.getOrderType();
        
        if ("MARKET".equals(orderType)) {
            // Market order - execute immediately at current price
            MarketDataService.StockData stock = marketDataService.getStockPrice(transaction.getSymbol());
            if (stock == null) {
                throw new RuntimeException("Unable to fetch live price for " + transaction.getSymbol());
            }
            transaction.setPrice(stock.getPrice());
        } else if ("LIMIT".equals(orderType)) {
            // Limit order - execute only at specified price or better
            if (transaction.getLimitPrice() == null) {
                throw new RuntimeException("Limit price required for limit order");
            }
            transaction.setPrice(transaction.getLimitPrice());
        } else if ("STOP_LOSS".equals(orderType)) {
            // Stop loss order - execute when price reaches stop price
            if (transaction.getStopPrice() == null) {
                throw new RuntimeException("Stop price required for stop loss order");
            }
            // For now, execute at market
            MarketDataService.StockData stock = marketDataService.getStockPrice(transaction.getSymbol());
            if (stock != null) {
                transaction.setPrice(stock.getPrice());
            }
        } else if ("STOP_LIMIT".equals(orderType)) {
            // Stop limit order - combination of stop loss and limit
            if (transaction.getStopPrice() == null || transaction.getLimitPrice() == null) {
                throw new RuntimeException("Stop price and limit price required for stop limit order");
            }
            MarketDataService.StockData stock = marketDataService.getStockPrice(transaction.getSymbol());
            if (stock != null) {
                transaction.setPrice(stock.getPrice());
            }
        }
        
        // Set transaction date/time
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(new Date());
        }
        transaction.setTransactionTime(new Date());
        
        // Check balance for BUY transactions before executing
        if ("BUY".equalsIgnoreCase(transaction.getType())) {
            double totalCost = transaction.getQuantity() * transaction.getPrice();
            Double currentBalance = paymentServiceClient.getBalance(user.getId());
            
            if (currentBalance < totalCost) {
                throw new RuntimeException("Insufficient balance. Required: " + totalCost + ", Available: " + currentBalance);
            }
            
            // Deduct balance for purchase
            boolean deducted = paymentServiceClient.deductBalance(user.getId(), totalCost);
            if (!deducted) {
                throw new RuntimeException("Failed to deduct balance for purchase");
            }
        }
        
        Transaction savedTransaction = transactionRepository.save(transaction);
        
        // For SELL transactions, add the sale amount to balance
        if ("SELL".equalsIgnoreCase(transaction.getType()) && "EXECUTED".equals(savedTransaction.getStatus())) {
            double totalSaleAmount = transaction.getQuantity() * transaction.getPrice();
            paymentServiceClient.addBalance(user.getId(), totalSaleAmount);
        }
        
        // Update holdings if order is executed
        if ("EXECUTED".equals(savedTransaction.getStatus())) {
            updateHoldingsAfterTransaction(savedTransaction, user);
        }
        
        return savedTransaction;
    }

    @Transactional
    public Transaction placeAdvancedOrder(Transaction transaction, String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        transaction.setUser(user);
        transaction.setStatus("PENDING");
        
        // Calculate execution based on order type
        String orderType = transaction.getOrderType();
        MarketDataService.StockData stock = marketDataService.getStockPrice(transaction.getSymbol());
        
        if (stock == null) {
            transaction.setStatus("FAILED");
            return transactionRepository.save(transaction);
        }
        
        boolean shouldExecute = false;
        double executionPrice = stock.getPrice();
        
        switch (orderType) {
            case "MARKET":
                shouldExecute = true;
                executionPrice = stock.getPrice();
                break;
                
            case "LIMIT":
                // Execute if current price is at or better than limit price
                double limitPrice = transaction.getLimitPrice();
                if ("BUY".equalsIgnoreCase(transaction.getType())) {
                    shouldExecute = executionPrice <= limitPrice;
                } else {
                    shouldExecute = executionPrice >= limitPrice;
                }
                break;
                
            case "STOP_LOSS":
                // Execute when stop price is triggered
                double stopPrice = transaction.getStopPrice();
                if ("BUY".equalsIgnoreCase(transaction.getType())) {
                    shouldExecute = executionPrice >= stopPrice;
                } else {
                    shouldExecute = executionPrice <= stopPrice;
                }
                break;
                
            case "STOP_LIMIT":
                // Combination - execute when stop triggered, then at limit or better
                double stop = transaction.getStopPrice();
                double limit = transaction.getLimitPrice();
                boolean stopTriggered = ("BUY".equalsIgnoreCase(transaction.getType())) 
                    ? executionPrice >= stop : executionPrice <= stop;
                if (stopTriggered) {
                    if ("BUY".equalsIgnoreCase(transaction.getType())) {
                        shouldExecute = executionPrice <= limit;
                    } else {
                        shouldExecute = executionPrice >= limit;
                    }
                }
                break;
                
            default:
                shouldExecute = true;
        }
        
        transaction.setPrice(executionPrice);
        
        if (shouldExecute) {
            transaction.setStatus("EXECUTED");
            Transaction saved = transactionRepository.save(transaction);
            updateHoldingsAfterTransaction(saved, user);
            return saved;
        } else {
            // Keep as pending - would need a scheduler to check periodically
            return transactionRepository.save(transaction);
        }
    }

    private void updateHoldingsAfterTransaction(Transaction transaction, User user) {
        String symbol = transaction.getSymbol();
        String type = transaction.getType().toUpperCase();
        double quantity = transaction.getQuantity();
        double price = transaction.getPrice();
        
        Portfolio portfolio = getOrCreateDefaultPortfolio(user);
        
        List<Holding> userHoldings = holdingRepository.findByUserId(user.getId());
        Optional<Holding> existingHolding = userHoldings.stream()
                .filter(h -> h.getSymbol().equalsIgnoreCase(symbol))
                .findFirst();
        
        if ("BUY".equals(type)) {
            if (existingHolding.isPresent()) {
                Holding holding = existingHolding.get();
                double currentValue = holding.getQuantity() * holding.getAverageCost();
                double newValue = quantity * price;
                double totalQuantity = holding.getQuantity() + quantity;
                double newAverageCost = (currentValue + newValue) / totalQuantity;
                
                holding.setQuantity(totalQuantity);
                holding.setAverageCost(newAverageCost);
                holding.setTotalCost(totalQuantity * newAverageCost);
                
                MarketDataService.StockData stock = marketDataService.getStockPrice(symbol);
                if (stock != null) {
                    holding.setCurrentPrice(stock.getPrice());
                    holding.setCurrentValue(totalQuantity * stock.getPrice());
                    holding.setProfitLoss(holding.getCurrentValue() - holding.getTotalCost());
                    if (holding.getTotalCost() > 0) {
                        holding.setProfitLossPercentage((holding.getProfitLoss() / holding.getTotalCost()) * 100);
                    }
                }
                
                holdingRepository.save(holding);
            } else {
                Holding newHolding = new Holding();
                newHolding.setUser(user);
                newHolding.setPortfolio(portfolio);
                newHolding.setSymbol(symbol);
                newHolding.setQuantity(quantity);
                newHolding.setAverageCost(price);
                newHolding.setTotalCost(quantity * price);
                
                MarketDataService.StockData stock = marketDataService.getStockPrice(symbol);
                if (stock != null) {
                    newHolding.setCurrentPrice(stock.getPrice());
                    newHolding.setCurrentValue(quantity * stock.getPrice());
                    newHolding.setProfitLoss(newHolding.getCurrentValue() - newHolding.getTotalCost());
                    if (newHolding.getTotalCost() > 0) {
                        newHolding.setProfitLossPercentage((newHolding.getProfitLoss() / newHolding.getTotalCost()) * 100);
                    }
                }
                
                holdingRepository.save(newHolding);
            }
        } else if ("SELL".equals(type)) {
            if (existingHolding.isPresent()) {
                Holding holding = existingHolding.get();
                double newQuantity = holding.getQuantity() - quantity;
                
                if (newQuantity <= 0) {
                    holdingRepository.delete(holding);
                } else {
                    holding.setQuantity(newQuantity);
                    holding.setTotalCost(newQuantity * holding.getAverageCost());
                    
                    MarketDataService.StockData stock = marketDataService.getStockPrice(symbol);
                    if (stock != null) {
                        holding.setCurrentPrice(stock.getPrice());
                        holding.setCurrentValue(newQuantity * stock.getPrice());
                        holding.setProfitLoss(holding.getCurrentValue() - holding.getTotalCost());
                        if (holding.getTotalCost() > 0) {
                            holding.setProfitLossPercentage((holding.getProfitLoss() / holding.getTotalCost()) * 100);
                        }
                    }
                    
                    holdingRepository.save(holding);
                }
            }
        }
    }

    private Portfolio getOrCreateDefaultPortfolio(User user) {
        List<Portfolio> portfolios = portfolioRepository.findByUserId(user.getId());
        for (Portfolio p : portfolios) {
            if (p.getIsDefault() != null && p.getIsDefault()) {
                return p;
            }
        }
        
        Portfolio defaultPortfolio = new Portfolio();
        defaultPortfolio.setName("Default Portfolio");
        defaultPortfolio.setDescription("Auto-created default portfolio");
        defaultPortfolio.setIsDefault(true);
        defaultPortfolio.setUser(user);
        defaultPortfolio.setTotalValue(0.0);
        defaultPortfolio.setTotalCost(0.0);
        defaultPortfolio.setTotalProfitLoss(0.0);
        defaultPortfolio.setCreatedAt(new Date());
        return portfolioRepository.save(defaultPortfolio);
    }
}
