package com.tnc.domain.analytics.util;

import com.tnc.domain.holdings.dto.HoldingRowDTO;
import com.tnc.domain.analytics.dto.TopMoversDTO;
import com.tnc.domain.analytics.dto.AllocationDTO;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
public class AnalyticsCalculator {

    /**\n     * Get top N gaining stocks\n     */\n    public static List<TopMoversDTO> getTopGainers(List<HoldingRowDTO> holdings, int limit) {\n        return holdings.stream()\n                .filter(h -> h.getGainLoss().compareTo(BigDecimal.ZERO) > 0)\n                .sorted((a, b) -> b.getGainLoss().compareTo(a.getGainLoss()))\n                .limit(limit)\n                .map(h -> TopMoversDTO.builder()\n                        .symbol(h.getSymbol())\n                        .gainLoss(h.getGainLoss())\n                        .gainLossPercent(h.getGainLossPercent())\n                        .quantity(h.getQuantity())\n                        .currentValue(h.getCurrentValue())\n                        .build())\n                .collect(Collectors.toList());\n    }\n\n    /**\n     * Get top N losing stocks\n     */\n    public static List<TopMoversDTO> getTopLosers(List<HoldingRowDTO> holdings, int limit) {\n        return holdings.stream()\n                .filter(h -> h.getGainLoss().compareTo(BigDecimal.ZERO) < 0)\n                .sorted(Comparator.comparing(HoldingRowDTO::getGainLoss))\n                .limit(limit)\n                .map(h -> TopMoversDTO.builder()\n                        .symbol(h.getSymbol())\n                        .gainLoss(h.getGainLoss())\n                        .gainLossPercent(h.getGainLossPercent())\n                        .quantity(h.getQuantity())\n                        .currentValue(h.getCurrentValue())\n                        .build())\n                .collect(Collectors.toList());\n    }\n\n    /**\n     * Calculate portfolio allocation by symbol\n     */\n    public static List<AllocationDTO> calculateAllocation(List<HoldingRowDTO> holdings) {\n        BigDecimal totalValue = holdings.stream()\n                .map(HoldingRowDTO::getCurrentValue)\n                .reduce(BigDecimal.ZERO, BigDecimal::add);\n\n        if (totalValue.compareTo(BigDecimal.ZERO) <= 0) {\n            return Collections.emptyList();\n        }\n\n        return holdings.stream()\n                .map(h -> {\n                    BigDecimal percentage = h.getCurrentValue()\n                            .divide(totalValue, 4, RoundingMode.HALF_UP)\n                            .multiply(new BigDecimal(\"100\"))\n                            .setScale(2, RoundingMode.HALF_UP);\n                    return AllocationDTO.builder()\n                            .symbol(h.getSymbol())\n                            .value(h.getCurrentValue())\n                            .percentage(percentage)\n                            .build();\n                })\n                .sorted((a, b) -> b.getPercentage().compareTo(a.getPercentage()))\n                .collect(Collectors.toList());\n    }\n}
