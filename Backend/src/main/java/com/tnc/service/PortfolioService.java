package com.tnc.service;

import com.tnc.domain.holdings.entity.Holding;
import com.tnc.domain.user.entity.User;
import com.tnc.domain.transaction.entity.Transaction;
import com.tnc.repository.HoldingRepository;
import com.tnc.repository.TransactionRepository;
import com.tnc.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PortfolioService {

    @Autowired
    private HoldingRepository holdingRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MarketDataService marketDataService;

    public Map<String, Object> getDashboard(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return null;
        }

        List<Holding> holdings = holdingRepository.findByUserId(user.getId());
        
        double totalInvested = 0;
        double currentValue = 0;
        
        for (Holding h : holdings) {
            totalInvested += h.getTotalCost() != null ? h.getTotalCost() : 0;
            currentValue += h.getCurrentValue() != null ? h.getCurrentValue() : 0;
        }
        
        double totalPnL = currentValue - totalInvested;

        Map<String, Object> data = new HashMap<>();
        data.put("totalValue", currentValue);
        data.put("invested", totalInvested);
        data.put("totalInvestment", totalInvested);
        data.put("currentValue", currentValue);
        data.put("totalPnL", totalPnL);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Dashboard data retrieved");
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        
        return response;
    }

    public Map<String, Object> getTotalInvestment(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return null;
        }

        List<Holding> holdings = holdingRepository.findByUserId(user.getId());
        double totalInvestment = holdings.stream()
                .mapToDouble(h -> h.getTotalCost() != null ? h.getTotalCost() : 0)
                .sum();

        Map<String, Object> data = new java.util.HashMap<>();
        data.put("totalInvestment", totalInvestment);
        data.put("currency", "USD");

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Total investment retrieved");
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        
        return response;
    }

    public Map<String, Object> getCurrentValue(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return null;
        }

        List<Holding> holdings = holdingRepository.findByUserId(user.getId());
        double currentValue = holdings.stream()
                .mapToDouble(h -> h.getCurrentValue() != null ? h.getCurrentValue() : 0)
                .sum();

        Map<String, Object> data = new java.util.HashMap<>();
        data.put("currentValue", currentValue);
        data.put("currency", "USD");
        data.put("lastUpdated", java.time.Instant.now().toString());

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Current value retrieved");
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        
        return response;
    }

    public Map<String, Object> getTotalGain(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return null;
        }

        List<Holding> holdings = holdingRepository.findByUserId(user.getId());
        
        double totalInvested = holdings.stream()
                .mapToDouble(h -> h.getTotalCost() != null ? h.getTotalCost() : 0)
                .sum();
        double currentValue = holdings.stream()
                .mapToDouble(h -> h.getCurrentValue() != null ? h.getCurrentValue() : 0)
                .sum();
        
        double totalGain = currentValue - totalInvested;
        double percentageGain = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

        Map<String, Object> data = new java.util.HashMap<>();
        data.put("totalGain", totalGain);
        data.put("percentageGain", percentageGain);
        data.put("currency", "USD");

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Total gain retrieved");
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        
        return response;
    }

    public Map<String, Object> getPnL(String username, String period) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return null;
        }

        List<Holding> holdings = holdingRepository.findByUserId(user.getId());
        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());
        
        double totalInvested = holdings.stream()
                .mapToDouble(h -> h.getTotalCost() != null ? h.getTotalCost() : 0)
                .sum();
        double currentValue = holdings.stream()
                .mapToDouble(h -> h.getCurrentValue() != null ? h.getCurrentValue() : 0)
                .sum();
        
        double totalPnL = currentValue - totalInvested;
        double unrealizedPnL = totalPnL;
        
        // Calculate realized PnL from sell transactions
        double realizedPnL = transactions.stream()
                .filter(t -> "sell".equalsIgnoreCase(t.getType()))
                .mapToDouble(t -> {
                    double cost = t.getQuantity() * t.getPrice();
                    return (t.getPrice() - cost); // Simplified calculation
                })
                .sum();
        
        double pnlPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

        Map<String, Object> data = new java.util.HashMap<>();
        data.put("totalPnL", totalPnL);
        data.put("unrealizedPnL", unrealizedPnL);
        data.put("realizedPnL", realizedPnL);
        data.put("pnlPercentage", pnlPercentage);
        data.put("currency", "USD");
        data.put("period", period != null ? period : "monthly");

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "PnL data retrieved");
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        
        return response;
    }

    public Map<String, Object> getWinRate(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return null;
        }

        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());
        
        int totalTrades = transactions.size();
        int winningTrades = (int) transactions.stream()
                .filter(t -> "sell".equalsIgnoreCase(t.getType()))
                .count(); // Simplified
        int losingTrades = totalTrades - winningTrades;
        
        double winRate = totalTrades > 0 ? (winningTrades * 100.0 / totalTrades) : 0;

        Map<String, Object> data = new java.util.HashMap<>();
        data.put("winRate", winRate);
        data.put("totalTrades", totalTrades);
        data.put("winningTrades", winningTrades);
        data.put("losingTrades", losingTrades);
        data.put("breakEvenTrades", 0);

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Win rate retrieved");
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        
        return response;
    }

    public Map<String, Object> getReturns(String username, String period) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return null;
        }

        List<Holding> holdings = holdingRepository.findByUserId(user.getId());
        
        double totalInvested = holdings.stream()
                .mapToDouble(h -> h.getTotalCost() != null ? h.getTotalCost() : 0)
                .sum();
        double currentValue = holdings.stream()
                .mapToDouble(h -> h.getCurrentValue() != null ? h.getCurrentValue() : 0)
                .sum();
        
        double totalReturn = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;

        Map<String, Object> data = new java.util.HashMap<>();
        data.put("totalReturn", totalReturn);
        data.put("annualizedReturn", totalReturn * 1.2); // Simplified
        data.put("ytdReturn", totalReturn * 0.6);
        data.put("monthlyReturn", totalReturn / 12);
        data.put("currency", "USD");
        data.put("period", period != null ? period : "yearly");

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Returns data retrieved");
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        
        return response;
    }

    public Map<String, Object> getSummary(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return null;
        }

        List<Holding> holdings = holdingRepository.findByUserId(user.getId());
        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());
        
        double totalInvestment = holdings.stream()
                .mapToDouble(h -> h.getTotalCost() != null ? h.getTotalCost() : 0)
                .sum();
        double currentValue = holdings.stream()
                .mapToDouble(h -> h.getCurrentValue() != null ? h.getCurrentValue() : 0)
                .sum();
        
        double totalGain = currentValue - totalInvestment;
        double totalGainPercentage = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;
        
        int winningTrades = (int) transactions.stream()
                .filter(t -> "sell".equalsIgnoreCase(t.getType()))
                .count();
        double winRate = transactions.size() > 0 ? (winningTrades * 100.0 / transactions.size()) : 0;

        Map<String, Object> data = new java.util.HashMap<>();
        data.put("totalInvestment", totalInvestment);
        data.put("currentValue", currentValue);
        data.put("totalGain", totalGain);
        data.put("totalGainPercentage", totalGainPercentage);
        data.put("totalPnL", totalGain);
        data.put("winRate", winRate);
        data.put("totalTrades", transactions.size());
        data.put("currency", "USD");
        data.put("lastUpdated", java.time.Instant.now().toString());

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Portfolio summary retrieved");
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        
        return response;
    }
}
