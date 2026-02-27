package com.tnc.service;

import com.tnc.domain.holdings.entity.Holding;
import com.tnc.domain.user.entity.User;
import com.tnc.repository.HoldingRepository;
import com.tnc.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarketDataScheduler {

    @Autowired
    private HoldingRepository holdingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MarketDataService marketDataService;

    // Run every second to update all holdings with live market prices
    @Scheduled(fixedRate = 1000)
    public void updateAllHoldingsWithLivePrices() {
        List<User> users = userRepository.findAll();
        
        for (User user : users) {
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
}
