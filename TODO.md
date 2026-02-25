# TODO - JWT Security Package Implementation - COMPLETED

## Backend (Java/Spring Boot) - COMPLETED

1. [x] Update Backend/pom.xml - Add Spring Security, JWT, JPA, MySQL, Validation dependencies
2. [x] Update Backend/src/main/resources/application.yml - Add database and JWT configuration
3. [x] Create User Model (Backend/src/main/java/com/tnc/domain/user/entity/User.java)
4. [x] Create UserRepository (Backend/src/main/java/com/tnc/domain/user/repository/UserRepository.java)
5. [x] Create DTOs (Backend/src/main/java/com/tnc/domain/user/dto/)
6. [x] Create AuthService (Backend/src/main/java/com/tnc/domain/user/service/AuthService.java)
7. [x] Create AuthController (Backend/src/main/java/com/tnc/domain/user/controller/AuthController.java)
8. [x] Create JWT Utils (Backend/src/main/java/com/tnc/common/security/JwtUtil.java)
9. [x] Create Custom UserDetailsService (Backend/src/main/java/com/tnc/domain/user/service/CustomUserDetailsService.java)
10. [x] Create JwtAuthenticationFilter (Backend/src/main/java/com/tnc/config/JwtAuthenticationFilter.java)
11. [x] Create SecurityConfig (Backend/src/main/java/com/tnc/config/SecurityConfig.java)
12. [x] Update PortfolioApplication.java - Add annotations

## Frontend (Angular) - COMPLETED

1. [x] Create User Model (Frontend/src/app/core/models/user.model.ts)
2. [x] Create AuthService (Frontend/src/app/core/services/auth.service.ts)
3. [x] Create AuthGuard (Frontend/src/app/core/guards/auth.guard.ts)
4. [x] Create AuthInterceptor (Frontend/src/app/core/interceptors/auth.interceptor.ts)
5. [x] Update app.config.ts - Add HttpClient provider
6. [x] Update environment.ts - Add API base URL

## Pages Created - COMPLETED

1. [x] Landing Page (Frontend/src/app/pages/landing/landing.component.ts)
2. [x] Login Page (Frontend/src/app/pages/login/login.component.ts)
3. [x] Signup Page (Frontend/src/app/pages/signup/signup.component.ts)
4. [x] Dashboard Page (Frontend/src/app/pages/dashboard/dashboard.component.ts)

## Routes Configured - COMPLETED

- / -> Landing Page
- /login -> Login Page
- /signup -> Signup Page
- /dashboard -> Dashboard (Protected by AuthGuard)
