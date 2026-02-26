package com.tnc.domain.portfolio.controller;

import com.tnc.common.api.ApiResponse;
import com.tnc.common.security.CurrentUserService;
import com.tnc.domain.portfolio.dto.PortfolioDTO;
import com.tnc.domain.portfolio.dto.AnalyticsDTO;
import com.tnc.domain.portfolio.service.AnalyticsService;
import com.tnc.domain.portfolio.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolios")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final AnalyticsService analyticsService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<ApiResponse<PortfolioDTO.PortfolioResponse>> createPortfolio(
            Authentication authentication,
            @RequestBody PortfolioDTO.PortfolioRequest request) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        PortfolioDTO.PortfolioResponse portfolio = portfolioService.createPortfolio(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(portfolio, "Portfolio created successfully"));
    }

    @GetMapping
    public ResponseEntity<List<PortfolioDTO.PortfolioSummary>> getUserPortfolios(
            Authentication authentication) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        List<PortfolioDTO.PortfolioSummary> portfolios = portfolioService.getUserPortfolios(userId);
        return ResponseEntity.ok(portfolios);
    }

    @GetMapping("/{portfolioId}")
    public ResponseEntity<ApiResponse<PortfolioDTO.PortfolioResponse>> getPortfolio(
            Authentication authentication,
            @PathVariable Long portfolioId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        PortfolioDTO.PortfolioResponse portfolio = portfolioService.getPortfolio(userId, portfolioId);
        return ResponseEntity.ok(ApiResponse.success(portfolio));
    }

    @PutMapping("/{portfolioId}")
    public ResponseEntity<ApiResponse<PortfolioDTO.PortfolioResponse>> updatePortfolio(
            Authentication authentication,
            @PathVariable Long portfolioId,
            @RequestBody PortfolioDTO.PortfolioRequest request) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        PortfolioDTO.PortfolioResponse portfolio = portfolioService.updatePortfolio(userId, portfolioId, request);
        return ResponseEntity.ok(ApiResponse.success(portfolio, "Portfolio updated successfully"));
    }

    @DeleteMapping("/{portfolioId}")
    public ResponseEntity<ApiResponse<Void>> deletePortfolio(
            Authentication authentication,
            @PathVariable Long portfolioId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        portfolioService.deletePortfolio(userId, portfolioId);
        return ResponseEntity.ok(ApiResponse.success(null, "Portfolio deleted successfully"));
    }

    @PostMapping("/{portfolioId}/refresh")
    public ResponseEntity<PortfolioDTO.PortfolioSummary> refreshPrices(
            Authentication authentication,
            @PathVariable Long portfolioId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        PortfolioDTO.PortfolioSummary summary = portfolioService.refreshPortfolioPrices(userId, portfolioId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{portfolioId}/dashboard")
    public ResponseEntity<AnalyticsDTO.DashboardData> getDashboard(
            Authentication authentication,
            @PathVariable Long portfolioId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        AnalyticsDTO.DashboardData dashboard = analyticsService.getDashboardSummary(userId, portfolioId);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/{portfolioId}/performance")
    public ResponseEntity<ApiResponse<List<AnalyticsDTO.StockPerformance>>> getStockPerformance(
            Authentication authentication,
            @PathVariable Long portfolioId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        List<AnalyticsDTO.StockPerformance> performance = analyticsService.getStockPerformance(userId, portfolioId);
        return ResponseEntity.ok(ApiResponse.success(performance));
    }

    @GetMapping("/{portfolioId}/sector-analysis")
    public ResponseEntity<ApiResponse<AnalyticsDTO.SectorAnalysis>> getSectorAnalysis(
            Authentication authentication,
            @PathVariable Long portfolioId) {
        Long userId = currentUserService.getCurrentUserId(authentication);
        AnalyticsDTO.SectorAnalysis analysis = analyticsService.getSectorAnalysis(userId, portfolioId);
        return ResponseEntity.ok(ApiResponse.success(analysis));
    }
}
