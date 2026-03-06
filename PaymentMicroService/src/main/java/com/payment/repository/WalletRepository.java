package com.payment.repository;

import com.payment.entity.WalletBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<WalletBalance, Long> {
    Optional<WalletBalance> findByUserId(Long userId);
}

