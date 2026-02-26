package com.tnc.repository;

import com.tnc.domain.holdings.entity.Holding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, Long> {
    List<Holding> findByUserId(Long userId);
    List<Holding> findByPortfolioId(Long portfolioId);
    Optional<Holding> findByUserIdAndSymbol(Long userId, String symbol);
    Optional<Holding> findByPortfolioIdAndSymbol(Long portfolioId, String symbol);
    
    @Query("SELECT h FROM Holding h WHERE h.user.id = ?1 AND h.symbol = ?2")
    Optional<Holding> findByUserIdAndSymbolNative(Long userId, String symbol);
}
