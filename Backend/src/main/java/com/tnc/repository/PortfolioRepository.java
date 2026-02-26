package com.tnc.repository;

import com.tnc.domain.portfolio.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findByUserId(Long userId);
    Optional<Portfolio> findByIdAndUserId(Long id, Long userId);
    Optional<Portfolio> findByUserIdAndIsDefault(Long userId, Boolean isDefault);
}
