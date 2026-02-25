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
public class AllocationDTO {
    private String symbol;
    private BigDecimal value;
    private BigDecimal percentage;
}
