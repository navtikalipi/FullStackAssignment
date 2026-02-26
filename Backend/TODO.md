# TODO - User Authentication with JPA Implementation

## Phase 1: Dependencies
- [x] Update pom.xml with JPA, MySQL, Lombok, Swagger dependencies

## Phase 2: Entity Layer
- [x] Create persistence/entity/BaseEntity.java
- [x] Create domain/user/entity/User.java
- [x] Create domain/portfolio/entity/Portfolio.java
- [x] Create domain/holdings/entity/Holding.java
- [x] Create domain/transaction/entity/Transaction.java

## Phase 3: Repository Layer
- [x] Create repository/UserRepository.java
- [x] Create repository/PortfolioRepository.java
- [x] Create repository/HoldingRepository.java
- [x] Create repository/TransactionRepository.java

## Phase 4: Service Updates
- [x] Update JwtUserDetailsService to use DB authentication

## Phase 5: Swagger Configuration
- [x] Add Swagger configuration for API documentation
- [x] Configure WebSecurityConfig to allow Swagger endpoints

## Phase 6: Market Data (Python Mock)
- [x] Create Python script for mock market data at localhost:7666/market

## Phase 7: Controllers & Endpoints
- [x] Create UserController for registration
- [x] Update application.properties

## Phase 8: Test & Verify
- [ ] Run the application and verify Swagger UI works
- [ ] Test authentication with database users
