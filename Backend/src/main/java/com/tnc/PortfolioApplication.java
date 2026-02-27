package com.tnc;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;

import java.io.File;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class PortfolioApplication {

	public static void main(String[] args) {
		SpringApplication.run(PortfolioApplication.class, args);
	}

	@Bean
	public CommandLineRunner initReportsDirectory() {
		return args -> {
			File reportsDir = new File("./reports");
			if (!reportsDir.exists()) {
				reportsDir.mkdirs();
				System.out.println("Created reports directory: " + reportsDir.getAbsolutePath());
			} else {
				System.out.println("Reports directory already exists: " + reportsDir.getAbsolutePath());
			}
		};
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**").allowedOrigins("*");
			}
			
			@Override
			public void addResourceHandlers(ResourceHandlerRegistry registry) {
				registry.addResourceHandler("/swagger-ui/**")
					.addResourceLocations("classpath:/META-INF/resources/webjars/swagger-ui/");
				registry.addResourceHandler("/webjars/**")
					.addResourceLocations("classpath:/META-INF/resources/webjars/");
			}
		};
	}
}
