package com.tnc.domain.portfolio.controller;

import com.tnc.common.api.ApiResponse;
import com.tnc.common.security.CurrentUserService;
import com.tnc.domain.portfolio.dto.AnalyticsDTO;
import com.tnc.domain.portfolio.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/portfolios/{portfolioId}/reports")
@RequiredArgsConstructor
public class ReportController {

    private final AnalyticsService analyticsService;
        private final CurrentUserService currentUserService;

    @GetMapping("/profit-loss")
    public ResponseEntity<ApiResponse<AnalyticsDTO.ProfitLossReport>> getProfitLossReport(
                        Authentication authentication,
            @PathVariable Long portfolioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                Long userId = currentUserService.getCurrentUserId(authentication);
        
        AnalyticsDTO.ProfitLossReport report = analyticsService.getProfitLossReport(
                                userId, portfolioId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/performance")
    public ResponseEntity<ApiResponse<List<AnalyticsDTO.StockPerformance>>> getPerformanceReport(
                        Authentication authentication,
            @PathVariable Long portfolioId) {
                Long userId = currentUserService.getCurrentUserId(authentication);
        
        List<AnalyticsDTO.StockPerformance> performance = analyticsService.getStockPerformance(
                                userId, portfolioId);
        return ResponseEntity.ok(ApiResponse.success(performance));
    }

    @GetMapping("/sector")
    public ResponseEntity<ApiResponse<AnalyticsDTO.SectorAnalysis>> getSectorReport(
                        Authentication authentication,
            @PathVariable Long portfolioId) {
                Long userId = currentUserService.getCurrentUserId(authentication);
        
        AnalyticsDTO.SectorAnalysis analysis = analyticsService.getSectorAnalysis(
                                userId, portfolioId);
        return ResponseEntity.ok(ApiResponse.success(analysis));
    }
}
