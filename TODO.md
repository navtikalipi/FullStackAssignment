# TODO - PaymentMicroService Integration

## Backend Changes
- [x] 1. Update User entity to add balance field (NOT NEEDED - using separate microservice)
- [x] 2. Create PaymentMicroService entity (WalletBalance)
- [x] 3. Create WalletBalanceRepository
- [x] 4. Create PaymentController with endpoints:
  - GET /api/wallet/balance - Get current balance
  - POST /api/wallet/deposit - Deposit money
  - POST /api/wallet/withdraw - Withdraw money
  - POST /api/wallet/deduct - Deduct for purchase
  - POST /api/wallet/add - Add for sale
- [x] 5. Create PaymentService for wallet operations
- [x] 6. Update TransactionsService to:
  - Check sufficient balance on BUY
  - Deduct balance on BUY
  - Add to balance on SELL
- [x] 7. Create PaymentServiceClient in main backend
- [x] 8. Add RestTemplate bean to SecurityBeansConfig
- [x] 9. Update JwtAuthenticationController to return userId

## Frontend Changes
- [x] 10. Create wallet.service.ts for API calls
- [x] 11. Create footer component with balance display, deposit, withdraw
- [x] 12. Update main-layout to include footer
- [x] 13. Update AuthService to store userId

## Docker Changes
- [x] 14. Create Dockerfile for PaymentMicroService
- [x] 15. Update docker-compose.yml to include payment service

## Testing
- [ ] 16. Test deposit flow
- [ ] 17. Test withdraw flow
- [ ] 18. Test buy with insufficient balance
- [ ] 19. Test buy with sufficient balance
- [ ] 20. Test sell updates balance

