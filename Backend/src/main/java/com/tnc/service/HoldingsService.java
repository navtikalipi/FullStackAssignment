package com.tnc.service;

import com.tnc.domain.holdings.entity.Holding;
import com.tnc.domain.portfolio.entity.Portfolio;
import com.tnc.domain.user.entity.User;
import com.tnc.repository.HoldingRepository;
import com.tnc.repository.PortfolioRepository;
import com.tnc.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class HoldingsService {

    @Autowired
    private HoldingRepository holdingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private MarketDataService marketDataService;

    public List<Holding> getAllHoldings(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return List.of();
        }
        return holdingRepository.findByUserId(user.getId());
    }

    public Optional<Holding> getHoldingById(Long id, String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return Optional.empty();
        }
        return holdingRepository.findById(id);
    }

    public Holding createHolding(Holding holding, String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        holding.setUser(user);
        
        // Assign default portfolio (create one if none exists)
        Portfolio portfolio = portfolioRepository.findByUserIdAndIsDefault(user.getId(), true)
                .orElseGet(() -> {
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
                });
        holding.setPortfolio(portfolio);
        
        holding.setTotalCost(holding.getQuantity() * holding.getAverageCost());
        
        // Get current price from market data
        MarketDataService.StockData stock = marketDataService.getStockPrice(holding.getSymbol());
        if (stock != null) {
            holding.setCurrentPrice(stock.getPrice());
            holding.setCurrentValue(holding.getQuantity() * stock.getPrice());
            holding.setProfitLoss(holding.getCurrentValue() - holding.getTotalCost());
            if (holding.getTotalCost() > 0) {
                holding.setProfitLossPercentage((holding.getProfitLoss() / holding.getTotalCost()) * 100);
            }
        }
        
        return holdingRepository.save(holding);
    }

    public void updateCurrentPrices(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return;
        }
        
        List<Holding> holdings = holdingRepository.findByUserId(user.getId());
        for (Holding holding : holdings) {
            MarketDataService.StockData stock = marketDataService.getStockPrice(holding.getSymbol());
            if (stock != null) {
                holding.setCurrentPrice(stock.getPrice());
                holding.setCurrentValue(holding.getQuantity() * stock.getPrice());
                holding.setProfitLoss(holding.getCurrentValue() - holding.getTotalCost());
                if (holding.getTotalCost() > 0) {
                    holding.setProfitLossPercentage((holding.getProfitLoss() / holding.getTotalCost()) * 100);
                }
                holdingRepository.save(holding);
            }
        }
    }
}
