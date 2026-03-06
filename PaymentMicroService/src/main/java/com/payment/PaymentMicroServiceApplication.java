package com.payment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PaymentMicroServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaymentMicroServiceApplication.class, args);
    }
}

