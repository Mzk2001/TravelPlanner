package com.travelplanner.controller;

import com.travelplanner.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * AI服务控制器
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Slf4j
public class AiController {
    
    private final AiService aiService;
    
    /**
     * 测试AI服务API Key
     * 
     * @param request 测试请求
     * @return 测试结果
     */
    @PostMapping("/test")
    public ResponseEntity<?> testAiService(@RequestBody(required = false) Map<String, Object> request) {
        try {
            log.info("收到AI测试请求，请求体: {}", request);
            String apiKey = null;
            
            // 处理不同的请求格式
            if (request != null) {
                Object apiKeyObj = request.get("apiKey");
                if (apiKeyObj != null) {
                    apiKey = apiKeyObj.toString().trim();
                }
            }
            
            // 如果请求体为空或没有apiKey，尝试从URL参数获取
            if (apiKey == null || apiKey.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createResponseMap(false, "API Key不能为空，请提供有效的API Key"));
            }
            
            log.info("测试AI服务API Key: {}", apiKey.substring(0, Math.min(10, apiKey.length())) + "...");
            boolean isValid = aiService.testApiKey(apiKey);
            
            if (isValid) {
                return ResponseEntity.ok(createResponseMap(true, "API Key有效，AI服务可用"));
            } else {
                return ResponseEntity.ok(createResponseMap(false, "API Key无效或服务不可用"));
            }
            
        } catch (Exception e) {
            log.error("测试AI服务失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(createResponseMap(false, "测试失败: " + e.getMessage()));
        }
    }
    
    /**
     * 测试AI服务API Key (GET方法，用于简单测试)
     * 
     * @param apiKey API Key
     * @return 测试结果
     */
    @GetMapping("/test")
    public ResponseEntity<?> testAiServiceGet(@RequestParam(required = false) String apiKey) {
        try {
            if (apiKey == null || apiKey.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createResponseMap(false, "API Key不能为空，请提供有效的API Key"));
            }
            
            log.info("测试AI服务API Key: {}", apiKey.substring(0, Math.min(10, apiKey.length())) + "...");
            boolean isValid = aiService.testApiKey(apiKey);
            
            if (isValid) {
                return ResponseEntity.ok(createResponseMap(true, "API Key有效，AI服务可用"));
            } else {
                return ResponseEntity.ok(createResponseMap(false, "API Key无效或服务不可用"));
            }
            
        } catch (Exception e) {
            log.error("测试AI服务失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(createResponseMap(false, "测试失败: " + e.getMessage()));
        }
    }
    
    /**
     * 使用当前用户的API Key生成旅游计划
     * 
     * @param userId 用户ID
     * @param request 生成请求
     * @return 生成的计划
     */
    @PostMapping("/generate/{userId}")
    public ResponseEntity<?> generateWithUserKey(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            String userMessage = request.get("userMessage");
            String planContext = request.get("planContext");
            
            if (userMessage == null || userMessage.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createResponseMap(false, "用户消息不能为空"));
            }
            
            log.info("使用用户 {} 的API Key生成旅游计划", userId);
            String result = aiService.generateTravelPlan(userId, userMessage, planContext != null ? planContext : "");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("result", result);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("生成旅游计划失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(createResponseMap(false, "生成失败: " + e.getMessage()));
        }
    }
    
    /**
     * 使用自定义API Key生成旅游计划（保留向后兼容）
     * 
     * @param request 生成请求
     * @return 生成的计划
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateWithCustomKey(@RequestBody Map<String, String> request) {
        try {
            String apiKey = request.get("apiKey");
            String userMessage = request.get("userMessage");
            String planContext = request.get("planContext");
            
            if (apiKey == null || apiKey.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createResponseMap(false, "API Key不能为空"));
            }
            
            if (userMessage == null || userMessage.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createResponseMap(false, "用户消息不能为空"));
            }
            
            log.info("使用自定义API Key生成旅游计划");
            String result = aiService.generateTravelPlanWithCustomKey(
                apiKey, 
                userMessage, 
                planContext != null ? planContext : ""
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("result", result);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("生成旅游计划失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(createResponseMap(false, "生成失败: " + e.getMessage()));
        }
    }
    
    /**
     * 创建响应Map
     */
    private Map<String, Object> createResponseMap(boolean success, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        return response;
    }
}
