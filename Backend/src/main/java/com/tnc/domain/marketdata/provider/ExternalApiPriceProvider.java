package com.tnc.domain.marketdata.provider;

import com.tnc.domain.marketdata.dto.PriceQuoteDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@ConditionalOnProperty(name = "market.data.provider", havingValue = "external")
public class ExternalApiPriceProvider implements StockPriceProvider {

    // TODO: Integrate with actual stock price APIs
    // Options:
    // 1. NSE India API
    // 2. Alpha Vantage API
    // 3. Yahoo Finance API
    // 4. Twelve Data API

    @Override
    public PriceQuoteDTO getPrice(String symbol) {
        log.warn("External API provider not yet implemented. Using mock data instead.");
        return null;
    }

    @Override
    public List<PriceQuoteDTO> getPrices(List<String> symbols) {
        log.warn("External API provider not yet implemented. Using mock data instead.");
        return List.of();
    }
}
