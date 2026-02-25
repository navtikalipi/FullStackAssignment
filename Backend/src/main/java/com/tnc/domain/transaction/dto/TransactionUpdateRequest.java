package com.tnc.domain.transaction.dto;

import com.tnc.domain.transaction.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionUpdateRequest {
    private String symbol;
    private TransactionType type;
    private Integer quantity;
    private BigDecimal price;
    private LocalDate transactionDate;
    private BigDecimal sellPrice;
    private String notes;
}
