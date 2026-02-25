package com.tnc.domain.transaction.repository;

import com.tnc.domain.transaction.entity.Transaction;
import com.tnc.domain.transaction.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findBySymbol(String symbol);

    List<Transaction> findByTypeOrderByTransactionDateDesc(TransactionType type);

    @Query("SELECT t FROM Transaction t WHERE t.symbol = :symbol AND t.type = :type AND t.isActive = true ORDER BY t.transactionDate DESC")
    List<Transaction> findActiveTransactionsBySymbolAndType(@Param("symbol") String symbol, @Param("type") TransactionType type);

    @Query("SELECT t FROM Transaction t WHERE t.symbol = :symbol AND t.isActive = true ORDER BY t.transactionDate ASC")
    List<Transaction> findActiveTransactionsBySymbol(@Param("symbol") String symbol);

    @Query("SELECT DISTINCT t.symbol FROM Transaction t WHERE t.isActive = true")
    List<String> findAllActiveSymbols();

    @Query("SELECT t FROM Transaction t WHERE t.transactionDate BETWEEN :startDate AND :endDate AND t.isActive = true ORDER BY t.transactionDate DESC")
    List<Transaction> findTransactionsByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
