package com.tnc.domain.stock.controller;

import com.tnc.common.api.ApiResponse;
import com.tnc.common.security.CurrentUserService;
import com.tnc.domain.stock.dto.StockDTO;
import com.tnc.domain.stock.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolios/{portfolioId}/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockDTO.StockResponse>>> getStocks(
            Authentication authentication,
            @PathVariable Long portfolioId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        
        List<StockDTO.StockResponse> stocks = stockService.getPortfolioStocks(userId, portfolioId);
        return ResponseEntity.ok(ApiResponse.success(stocks));
    }

    @GetMapping("/{stockId}")
    public ResponseEntity<ApiResponse<StockDTO.StockResponse>> getStock(
            Authentication authentication,
            @PathVariable Long portfolioId,
            @PathVariable Long stockId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        
        StockDTO.StockResponse stock = stockService.getStock(userId, portfolioId, stockId);
        return ResponseEntity.ok(ApiResponse.success(stock));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StockDTO.StockResponse>> addStock(
            Authentication authentication,
            @PathVariable Long portfolioId,
            @RequestBody StockDTO.StockRequest request) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        
        StockDTO.StockResponse stock = stockService.addStock(userId, portfolioId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(stock, "Stock added successfully"));
    }

    @PutMapping("/{stockId}")
    public ResponseEntity<ApiResponse<StockDTO.StockResponse>> updateStock(
            Authentication authentication,
            @PathVariable Long portfolioId,
            @PathVariable Long stockId,
            @RequestBody StockDTO.StockRequest request) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        
        StockDTO.StockResponse stock = stockService.updateStock(userId, portfolioId, stockId, request);
        return ResponseEntity.ok(ApiResponse.success(stock, "Stock updated successfully"));
    }

    @DeleteMapping("/{stockId}")
    public ResponseEntity<ApiResponse<Void>> deleteStock(
            Authentication authentication,
            @PathVariable Long portfolioId,
            @PathVariable Long stockId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        
        stockService.deleteStock(userId, portfolioId, stockId);
        return ResponseEntity.ok(ApiResponse.success(null, "Stock deleted successfully"));
    }

    @GetMapping("/gainers")
    public ResponseEntity<ApiResponse<List<StockDTO.StockSummary>>> getTopGainers(
            Authentication authentication,
            @PathVariable Long portfolioId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        
        List<StockDTO.StockSummary> gainers = stockService.getTopGainers(userId, portfolioId);
        return ResponseEntity.ok(ApiResponse.success(gainers));
    }

    @GetMapping("/losers")
    public ResponseEntity<ApiResponse<List<StockDTO.StockSummary>>> getTopLosers(
            Authentication authentication,
            @PathVariable Long portfolioId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        
        List<StockDTO.StockSummary> losers = stockService.getTopLosers(userId, portfolioId);
        return ResponseEntity.ok(ApiResponse.success(losers));
    }

    @PostMapping("/{stockId}/refresh")
    public ResponseEntity<ApiResponse<StockDTO.StockResponse>> refreshStockPrice(
            Authentication authentication,
            @PathVariable Long portfolioId,
            @PathVariable Long stockId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        
        StockDTO.StockResponse stock = stockService.refreshStockPrice(userId, portfolioId, stockId);
        return ResponseEntity.ok(ApiResponse.success(stock, "Price refreshed successfully"));
    }
}
