package com.tnc.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tnc.service.MarketDataService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/market")
@CrossOrigin
public class MarketDataController {

    @Autowired
    private MarketDataService marketDataService;

    @GetMapping("/price/{symbol}")
    public ResponseEntity<?> getStockPrice(@PathVariable String symbol) {
        Map<String, Object> response = new HashMap<>();
        MarketDataService.StockData stock = marketDataService.getStockPrice(symbol);
        
        if (stock == null) {
            response.put("success", false);
            response.put("message", "Stock not found");
            return ResponseEntity.badRequest().body(response);
        }
        
        response.put("success", true);
        response.put("message", "Stock price retrieved");
        
        Map<String, Object> data = new HashMap<>();
        data.put("symbol", stock.getSymbol());
        data.put("price", stock.getPrice());
        data.put("change", 0.0);
        data.put("changePercent", 0.0);
        data.put("timestamp", System.currentTimeMillis());
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/info/{symbol}")
    public ResponseEntity<?> getStockInfo(@PathVariable String symbol) {
        Map<String, Object> response = new HashMap<>();
        MarketDataService.StockData stock = marketDataService.getStockInfo(symbol);
        
        if (stock == null) {
            response.put("success", false);
            response.put("message", "Stock not found");
            return ResponseEntity.badRequest().body(response);
        }
        
        response.put("success", true);
        response.put("message", "Stock info retrieved");
        
        Map<String, Object> data = new HashMap<>();
        data.put("symbol", stock.getSymbol());
        data.put("name", stock.getName());
        data.put("price", stock.getPrice());
        data.put("marketCap", stock.getMarketCap());
        data.put("peRatio", stock.getPeRatio());
        data.put("52WeekHigh", stock.getWeek52High());
        data.put("52WeekLow", stock.getWeek52Low());
        data.put("dividendYield", stock.getDividendYield());
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
}
