package com.travelplanner.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * AI服务类 - 集成科大讯飞和阿里通义千问
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {
    
    private final RestTemplate restTemplate;
    
    @Value("${app.xunfei.api-key:}")
    private String xunfeiApiKey;
    
    @Value("${app.xunfei.api-secret:}")
    private String xunfeiApiSecret;
    
    @Value("${app.qwen.api-key:}")
    private String qwenApiKey;
    
    @Value("${app.qwen.base-url:https://dashscope.aliyuncs.com/api/v1}")
    private String qwenBaseUrl;
    
    /**
     * 使用通义千问生成旅游计划
     * 
     * @param userMessage 用户消息
     * @param planContext 计划上下文
     * @return AI生成的回复
     */
    public String generateTravelPlan(String userMessage, String planContext) {
        try {
            log.info("使用通义千问生成旅游计划");
            
            Map<String, Object> request = new HashMap<>();
            request.put("model", "qwen-turbo");
            
            Map<String, Object> messages = new HashMap<>();
            messages.put("role", "user");
            messages.put("content", buildPrompt(userMessage, planContext));
            
            request.put("messages", new Object[]{messages});
            request.put("temperature", 0.7);
            request.put("max_tokens", 2000);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + qwenApiKey);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            String url = qwenBaseUrl + "/services/aigc/text-generation/generation";
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>) (Class<?>) Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                @SuppressWarnings("unchecked")
                Map<String, Object> output = (Map<String, Object>) responseBody.get("output");
                String text = (String) output.get("text");
                
                log.info("通义千问生成成功");
                return text;
            }
            
            return "抱歉，AI服务暂时不可用，请稍后再试。";
            
        } catch (Exception e) {
            log.error("通义千问生成失败: {}", e.getMessage());
            return "抱歉，生成旅游计划时发生错误，请稍后再试。";
        }
    }
    
    /**
     * 语音转文字（科大讯飞）
     * 
     * @param audioData 音频数据
     * @return 转换后的文字
     */
    public String speechToText(byte[] audioData) {
        try {
            log.info("使用科大讯飞进行语音转文字");
            
            // 这里需要实现科大讯飞的语音识别API调用
            // 由于需要复杂的认证和音频处理，这里返回模拟结果
            return "语音转文字功能正在开发中...";
            
        } catch (Exception e) {
            log.error("语音转文字失败: {}", e.getMessage());
            return "语音识别失败，请重试。";
        }
    }
    
    /**
     * 文字转语音（科大讯飞）
     * 
     * @param text 要转换的文字
     * @return 音频文件URL
     */
    public String textToSpeech(String text) {
        try {
            log.info("使用科大讯飞进行文字转语音");
            
            // 这里需要实现科大讯飞的语音合成API调用
            // 由于需要复杂的认证和音频处理，这里返回模拟结果
            return "text-to-speech-" + System.currentTimeMillis() + ".mp3";
            
        } catch (Exception e) {
            log.error("文字转语音失败: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * 构建AI提示词
     */
    private String buildPrompt(String userMessage, String planContext) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一个专业的旅游规划助手。请根据用户的需求，生成详细的旅游计划。\n\n");
        
        if (planContext != null && !planContext.isEmpty()) {
            prompt.append("当前计划信息：\n").append(planContext).append("\n\n");
        }
        
        prompt.append("用户需求：\n").append(userMessage).append("\n\n");
        prompt.append("请提供以下内容的旅游计划：\n");
        prompt.append("1. 行程安排（详细的时间安排）\n");
        prompt.append("2. 景点推荐（包含景点介绍和游览时间）\n");
        prompt.append("3. 住宿建议（酒店类型和位置）\n");
        prompt.append("4. 美食推荐（当地特色美食）\n");
        prompt.append("5. 交通方式（城市间和市内交通）\n");
        prompt.append("6. 预算估算（各项费用明细）\n");
        prompt.append("7. 注意事项（天气、文化、安全等）\n\n");
        prompt.append("请用中文回答，内容要详细实用，格式清晰。");
        
        return prompt.toString();
    }
}

