package com.tnc.domain.transaction.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
    private Date transactionDate;

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
}
