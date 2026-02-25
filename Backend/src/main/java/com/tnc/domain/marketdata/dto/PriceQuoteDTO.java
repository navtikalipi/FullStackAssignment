package com.tnc.domain.marketdata.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceQuoteDTO {
    private String symbol;
    private BigDecimal price;
    private BigDecimal previousClose;
    private BigDecimal dayChange;
    private BigDecimal dayChangePercent;
    private long volume;
    private LocalDateTime timestamp;
    private String source;
}
