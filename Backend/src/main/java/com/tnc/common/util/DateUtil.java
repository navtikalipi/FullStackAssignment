package com.tnc.common.util;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;

public class DateUtil {

    /**
     * Get start of current day
     */
    public static LocalDate getTodayStart() {
        return LocalDate.now();
    }

    /**
     * Get start of current month
     */
    public static LocalDate getMonthStart() {
        return LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
    }

    /**
     * Get end of current month
     */
    public static LocalDate getMonthEnd() {
        return LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());
    }

    /**
     * Get start of current year
     */
    public static LocalDate getYearStart() {
        return LocalDate.now().with(TemporalAdjusters.firstDayOfYear());
    }

    /**
     * Get end of current year
     */
    public static LocalDate getYearEnd() {
        return LocalDate.now().with(TemporalAdjusters.lastDayOfYear());
    }

    /**
     * Get start of previous month
     */
    public static LocalDate getPreviousMonthStart() {
        return LocalDate.now().minusMonths(1).with(TemporalAdjusters.firstDayOfMonth());
    }

    /**
     * Get start of N days ago
     */
    public static LocalDate getDaysAgo(int days) {
        return LocalDate.now().minusDays(days);
    }
}
