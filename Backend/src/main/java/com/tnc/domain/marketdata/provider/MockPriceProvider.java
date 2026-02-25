package com.tnc.domain.marketdata.provider;

import com.tnc.domain.marketdata.dto.PriceQuoteDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
@ConditionalOnProperty(name = "market.data.provider", havingValue = "mock", matchIfMissing = true)
public class MockPriceProvider implements StockPriceProvider {

    // Mock prices for common NSE stocks (as of Feb 2026)
    private static final Map<String, BigDecimal> MOCK_PRICES = new HashMap<String, BigDecimal>() {{
        put("TCS", new BigDecimal("4200.50"));
        put("INFY", new BigDecimal("1850.75"));
        put("RELIANCE", new BigDecimal("2750.25"));
        put("HDFC", new BigDecimal("2500.00"));
        put("WIPRO", new BigDecimal("520.30"));
        put("LT", new BigDecimal("3150.80"));
        put("MARUTI", new BigDecimal("12500.40"));
        put("BAJAJ-AUTO", new BigDecimal("8950.25"));
        put("HCLTECH", new BigDecimal("1580.50"));
        put("ASIANPAINT", new BigDecimal("3280.75"));
        put("ITC", new BigDecimal("385.20"));
        put("SBIN", new BigDecimal("680.10"));
        put("ICICIBANK", new BigDecimal("1050.40"));
        put("HINDUNILVR", new BigDecimal("2580.25"));
        put("AXISBANK", new BigDecimal("1120.80"));
    }};

    @Override
    public PriceQuoteDTO getPrice(String symbol) {
        return getPrices(List.of(symbol)).stream().findFirst().orElse(null);
    }

    @Override
    public List<PriceQuoteDTO> getPrices(List<String> symbols) {
        List<PriceQuoteDTO> quotes = new ArrayList<>();
        Random random = new Random();

        for (String symbol : symbols) {
            BigDecimal basePrice = MOCK_PRICES.getOrDefault(symbol, new BigDecimal("1000"));
            
            // Add some random variation (±2%)
            double variation = (random.nextDouble() - 0.5) * 0.04;
            BigDecimal currentPrice = basePrice.multiply(BigDecimal.ONE.add(new BigDecimal(variation)))
                    .setScale(2, RoundingMode.HALF_UP);
            
            BigDecimal previousClose = basePrice;
            BigDecimal dayChange = currentPrice.subtract(previousClose);
            BigDecimal dayChangePercent = dayChange.divide(previousClose, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP);

            PriceQuoteDTO quote = PriceQuoteDTO.builder()
                    .symbol(symbol)
                    .price(currentPrice)
                    .previousClose(previousClose)
                    .dayChange(dayChange)
                    .dayChangePercent(dayChangePercent)
                    .volume(random.nextLong(1_000_000, 1_000_000_000))
                    .timestamp(LocalDateTime.now())
                    .source("mock")
                    .build();
            quotes.add(quote);
        }
        return quotes;
    }
}
