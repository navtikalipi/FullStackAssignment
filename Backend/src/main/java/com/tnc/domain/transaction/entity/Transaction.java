package com.tnc.domain.transaction.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.tnc.persistence.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.util.Date;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "transactions")
public class Transaction extends BaseEntity {

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    private String type; // BUY or SELL

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false)
    private Double price;

    @Column(name = "transaction_date", nullable = false)
    @Temporal(TemporalType.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date transactionDate;

    @Column(name = "transaction_time")
    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private Date transactionTime;

    @Column(name = "order_type")
    private String orderType; // MARKET, LIMIT, STOP_LOSS, STOP_LIMIT

    @Column(name = "limit_price")
    private Double limitPrice;

    @Column(name = "stop_price")
    private Double stopPrice;

    @Column
    private String status; // PENDING, EXECUTED, CANCELLED, FAILED

    @Column(name = "sell_price")
    private Double sellPrice;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private com.tnc.domain.user.entity.User user;

    @ManyToOne
    @JoinColumn(name = "portfolio_id")
    @JsonBackReference
    private com.tnc.domain.portfolio.entity.Portfolio portfolio;

    // Transient field for JSON response
    @Transient
    @JsonProperty("date")
    public String getDateAsString() {
        if (transactionDate == null) return null;
        return new java.text.SimpleDateFormat("yyyy-MM-dd").format(transactionDate);
    }
    
    @Transient
    @JsonProperty("total")
    public Double getTotal() {
        return quantity * price;
    }
}
