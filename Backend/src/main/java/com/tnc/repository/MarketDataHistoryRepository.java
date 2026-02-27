package com.tnc.repository;

import com.tnc.domain.market.entity.MarketDataHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketDataHistoryRepository extends JpaRepository<MarketDataHistory, Long> {
    
    List<MarketDataHistory> findBySymbolOrderByRecordedAtDesc(String symbol);
    
    List<MarketDataHistory> findBySymbolAndRecordedAtBetweenOrderByRecordedAtAsc(
            String symbol, java.util.Date startDate, java.util.Date endDate);
    
    @Query("SELECT m FROM MarketDataHistory m WHERE m.symbol = :symbol ORDER BY m.recordedAt DESC")
    List<MarketDataHistory> findRecentBySymbol(@Param("symbol") String symbol, Pageable pageable);
}
