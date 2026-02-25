package com.tnc.domain.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequestDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private String reportType;  // SUMMARY, DETAILED, ALLOCATION
    private String format;      // PDF, EXCEL
}
