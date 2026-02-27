package com.tnc.domain.holdings.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.tnc.persistence.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "holdings")
public class Holding extends BaseEntity {

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    private Double quantity;

    @Column(name = "average_cost", nullable = false)
    @JsonProperty("purchasePrice")
    private Double averageCost;

    @Column(name = "current_price")
    private Double currentPrice;

    @Column(name = "total_cost")
    private Double totalCost;

    @Column(name = "current_value")
    private Double currentValue;

    @Column(name = "profit_loss")
    @JsonProperty("pnL")
    private Double profitLoss;

    @Column(name = "profit_loss_percentage")
    @JsonProperty("pnLPercentage")
    private Double profitLossPercentage;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private com.tnc.domain.user.entity.User user;

    @ManyToOne
    @JoinColumn(name = "portfolio_id", nullable = false)
    @JsonBackReference
    private com.tnc.domain.portfolio.entity.Portfolio portfolio;
}
