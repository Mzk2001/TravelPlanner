package com.travelplanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * 旅游助手Web应用主启动类
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
public class TravelPlannerApplication {

    public static void main(String[] args) {
        SpringApplication.run(TravelPlannerApplication.class, args);
    }
}
