package com.tnc.common.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class MathUtil {

    /**
     * Calculate weighted average
     */
    public static BigDecimal weightedAverage(BigDecimal[] values, BigDecimal[] weights) {
        BigDecimal totalWeightedValue = BigDecimal.ZERO;
        BigDecimal totalWeight = BigDecimal.ZERO;

        for (int i = 0; i < values.length; i++) {
            totalWeightedValue = totalWeightedValue.add(values[i].multiply(weights[i]));
            totalWeight = totalWeight.add(weights[i]);
        }

        if (totalWeight.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return totalWeightedValue.divide(totalWeight, 4, RoundingMode.HALF_UP);
    }

    /**
     * Round to 2 decimal places
     */
    public static BigDecimal round(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Round to N decimal places
     */
    public static BigDecimal round(BigDecimal value, int scale) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return value.setScale(scale, RoundingMode.HALF_UP);
    }
}
