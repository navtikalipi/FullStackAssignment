package com.tnc.common.util;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

public class MoneyUtil {

    private static final Locale INDIAN_LOCALE = new Locale("en", "IN");

    /**
     * Format amount in Indian Rupees (₹)
     */
    public static String formatINR(BigDecimal amount) {
        if (amount == null) {
            return "₹0.00";
        }
        NumberFormat nf = NumberFormat.getCurrencyInstance(INDIAN_LOCALE);
        return nf.format(amount);
    }

    /**
     * Format amount with Indian numbering system
     */
    public static String formatIndianNumber(BigDecimal amount) {
        if (amount == null) {
            return "0.00";
        }
        return String.format(INDIAN_LOCALE, "%,.2f", amount);
    }

    /**
     * Calculate percentage change
     */
    public static BigDecimal calculatePercentageChange(BigDecimal original, BigDecimal current) {
        if (original.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return current.subtract(original)
                .divide(original, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(new BigDecimal("100"));
    }

    /**
     * Calculate profit/loss
     */
    public static BigDecimal calculateProfitLoss(BigDecimal costPrice, BigDecimal salePrice, int quantity) {
        return salePrice.subtract(costPrice).multiply(new BigDecimal(quantity));
    }
}
