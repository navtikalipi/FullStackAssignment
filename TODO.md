# Task: Replace hardcoded CORS origins in controllers with values from docker-compose (via env var)

Status: 7/7 completed ✅

## Steps:

1. [x] Add `app.cors.allowed-origins=${FRONTEND_ORIGINS:http://stockfolio.duckdns.org,https://stockfolio.duckdns.org,http://localhost}` to Backend/src/main/resources/application.properties

2. [x] Edit Backend/src/main/java/com/tnc/config/WebSecurityConfig.java:
   - Add import org.springframework.beans.factory.annotation.Value;
   - Add `@Value("${app.cors.allowed-origins}") private String allowedOriginsStr;`
   - Replace hardcoded origins with `Arrays.asList(allowedOriginsStr.split(\",\"))`

3. [x] Remove @CrossOrigin block from Backend/src/main/java/com/tnc/controller/AnalyticsController.java

4. [x] Remove @CrossOrigin block from Backend/src/main/java/com/tnc/controller/HoldingsController.java

5. [x] Remove @CrossOrigin block from Backend/src/main/java/com/tnc/controller/HelloWorldController.java

6. [x] Remove @CrossOrigin block from remaining controllers: ReportsController.java, PortfolioController.java, MarketDataController.java, JwtAuthenticationController.java, UserController.java, TransactionsController.java

7. [x] Update TODO.md mark as completed
  - Followup: User adds FRONTEND_ORIGINS to docker-compose.yml backend env section
  - Test: docker-compose down &amp;&amp; docker-compose up --build
  - Verify browser network tab CORS headers

**Exact string to remove from all controllers:**
```
@CrossOrigin(
    origins = {"http://stockfolio.duckdns.org", "https://stockfolio.duckdns.org", "http://localhost"}
)
```

Note: Indentation is 1 space before @CrossOrigin in all files (except possibly some).

