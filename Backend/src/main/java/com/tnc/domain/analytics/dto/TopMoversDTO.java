package com.tnc.domain.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopMoversDTO {
    private String symbol;
    private BigDecimal gainLoss;
    private BigDecimal gainLossPercent;
    private int quantity;
    private BigDecimal currentValue;
}
