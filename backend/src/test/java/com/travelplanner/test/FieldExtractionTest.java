package com.travelplanner.test;

import com.travelplanner.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.travelplanner")
public class FieldExtractionTest implements CommandLineRunner {
    
    @Autowired
    private AiService aiService;
    
    public static void main(String[] args) {
        SpringApplication.run(FieldExtractionTest.class, args);
    }
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== 测试字段提取功能 ===");
        
        String testMessage = "我想去日本东京旅游，预算1万元，2个人，喜欢美食和动漫";
        System.out.println("测试消息: " + testMessage);
        
        AiService.ExtractedFields fields = aiService.extractTravelFields(testMessage);
        
        System.out.println("提取结果:");
        System.out.println("  目的地: " + fields.getDestination());
        System.out.println("  预算: " + fields.getBudget());
        System.out.println("  人数: " + fields.getGroupSize());
        System.out.println("  旅行类型: " + fields.getTravelType());
        
        System.exit(0);
    }
}