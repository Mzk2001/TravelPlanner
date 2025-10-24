package com.travelplanner.controller;

import com.travelplanner.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 测试控制器 - 用于测试字段提取功能
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {
    
    private final AiService aiService;
    
    /**
     * 测试字段提取功能
     */
    @PostMapping("/extract-fields")
    public ResponseEntity<Map<String, Object>> testExtractFields(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            if (message == null || message.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "消息不能为空");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            log.info("测试字段提取，输入消息: {}", message);
            
            // 调用字段提取服务
            AiService.ExtractedFields fields = aiService.extractTravelFields(message);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("fields", fields);
            response.put("message", message);
            
            log.info("字段提取测试完成: {}", fields);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("字段提取测试失败", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}