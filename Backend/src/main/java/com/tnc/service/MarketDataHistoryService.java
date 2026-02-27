package com.tnc.service;

import com.tnc.domain.market.entity.MarketDataHistory;
import com.tnc.repository.MarketDataHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class MarketDataHistoryService {

    @Autowired
    private MarketDataHistoryRepository marketDataHistoryRepository;

    @Autowired
    private MarketDataService marketDataService;

    // Record market data every second
    @Scheduled(fixedRate = 1000)
    public void recordMarketData() {
        List<MarketDataService.StockData> stocks = marketDataService.getAllStocks();
        
        for (MarketDataService.StockData stock : stocks) {
            try {
                MarketDataHistory history = new MarketDataHistory();
                history.setSymbol(stock.getSymbol());
                history.setName(stock.getName());
                history.setClosePrice(stock.getPrice());
                history.setOpenPrice(stock.getPrice());
                history.setHighPrice(stock.getPrice());
                history.setLowPrice(stock.getPrice());
                history.setPreviousClose(stock.getPrice());
                history.setChange(0.0);
                history.setChangePercent(0.0);
                history.setVolume(System.currentTimeMillis() % 10000000);
                history.setRecordedAt(new Date());
                
                marketDataHistoryRepository.save(history);
            } catch (Exception e) {
                // Skip if error
            }
        }
    }

    public List<MarketDataHistory> getHistory(String symbol, int limit) {
        return marketDataHistoryRepository.findRecentBySymbol(symbol, PageRequest.of(0, limit));
    }

    public List<MarketDataHistory> getHistory(String symbol, Date startDate, Date endDate) {
        return marketDataHistoryRepository.findBySymbolAndRecordedAtBetweenOrderByRecordedAtAsc(symbol, startDate, endDate);
    }
}
