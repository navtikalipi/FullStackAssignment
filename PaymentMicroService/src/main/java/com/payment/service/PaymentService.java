package com.payment.service;

import com.payment.entity.WalletBalance;
import com.payment.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private WalletRepository walletRepository;

    public Double getBalance(Long userId) {
        Optional<WalletBalance> wallet = walletRepository.findByUserId(userId);
        return wallet.map(WalletBalance::getBalance).orElse(0.0);
    }

    @Transactional
    public WalletBalance deposit(Long userId, Double amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }

        Optional<WalletBalance> existingWallet = walletRepository.findByUserId(userId);
        
        if (existingWallet.isPresent()) {
            WalletBalance wallet = existingWallet.get();
            wallet.setBalance(wallet.getBalance() + amount);
            wallet.setUpdatedAt(new Date());
            return walletRepository.save(wallet);
        } else {
            WalletBalance newWallet = new WalletBalance(userId, amount);
            return walletRepository.save(newWallet);
        }
    }

    @Transactional
    public WalletBalance withdraw(Long userId, Double amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }

        WalletBalance wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (wallet.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance");
        }

        wallet.setBalance(wallet.getBalance() - amount);
        wallet.setUpdatedAt(new Date());
        return walletRepository.save(wallet);
    }

    @Transactional
    public boolean deductBalanceForPurchase(Long userId, Double amount) {
        if (amount == null || amount <= 0) {
            return false;
        }

        try {
            WalletBalance wallet = walletRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));

            if (wallet.getBalance() < amount) {
                return false;
            }

            wallet.setBalance(wallet.getBalance() - amount);
            wallet.setUpdatedAt(new Date());
            walletRepository.save(wallet);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public void addBalanceForSale(Long userId, Double amount) {
        if (amount == null || amount <= 0) {
            return;
        }

        Optional<WalletBalance> existingWallet = walletRepository.findByUserId(userId);
        
        if (existingWallet.isPresent()) {
            WalletBalance wallet = existingWallet.get();
            wallet.setBalance(wallet.getBalance() + amount);
            wallet.setUpdatedAt(new Date());
            walletRepository.save(wallet);
        } else {
            WalletBalance newWallet = new WalletBalance(userId, amount);
            walletRepository.save(newWallet);
        }
    }

    public WalletBalance createWalletIfNotExists(Long userId) {
        Optional<WalletBalance> existingWallet = walletRepository.findByUserId(userId);
        if (existingWallet.isPresent()) {
            return existingWallet.get();
        }
        
        WalletBalance newWallet = new WalletBalance(userId, 0.0);
        return walletRepository.save(newWallet);
    }
}

