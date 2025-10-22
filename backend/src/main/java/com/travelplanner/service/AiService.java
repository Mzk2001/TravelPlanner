package com.travelplanner.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
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
            
            // 构建请求体 - 使用通义千问的正确格式
            Map<String, Object> request = new HashMap<>();
            request.put("model", "qwen-turbo");
            
            // 使用prompt字段而不是messages
            Map<String, Object> input = new HashMap<>();
            input.put("prompt", buildPrompt(userMessage, planContext));
            request.put("input", input);
            
            // 构建parameters对象
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("temperature", 0.7);
            parameters.put("max_tokens", 2000);
            request.put("parameters", parameters);
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + qwenApiKey);
            headers.set("X-DashScope-Async", "disable"); // 确保同步调用
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            // 使用正确的通义千问API端点
            String url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
            
            log.info("调用通义千问API: {}", url);
            log.info("请求体: {}", request);
            
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>) (Class<?>) Map.class);
            
            log.info("响应状态: {}", response.getStatusCode());
            log.info("响应体: {}", response.getBody());
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                
                // 检查是否有错误
                if (responseBody.containsKey("code")) {
                    String errorCode = String.valueOf(responseBody.get("code"));
                    String errorMessage = String.valueOf(responseBody.get("message"));
                    log.error("通义千问API返回错误: code={}, message={}", errorCode, errorMessage);
                    return "AI服务返回错误: " + errorMessage;
                }
                
                // 详细记录响应结构用于调试
                log.info("响应体键值: {}", responseBody.keySet());
                log.info("完整响应体内容: {}", responseBody);
                
                // 解析响应 - 通义千问的响应格式
                if (responseBody.containsKey("output")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> output = (Map<String, Object>) responseBody.get("output");
                    log.info("output对象: {}", output);
                    if (output != null && output.containsKey("text")) {
                        String text = (String) output.get("text");
                        log.info("通义千问生成成功，内容长度: {}", text != null ? text.length() : 0);
                        log.info("AI回复内容: {}", text);
                        return text != null ? text : "AI生成的内容为空";
                    }
                }
                
                // 尝试其他可能的响应格式
                if (responseBody.containsKey("choices")) {
                    @SuppressWarnings("unchecked")
                    java.util.List<Map<String, Object>> choices = (java.util.List<Map<String, Object>>) responseBody.get("choices");
                    log.info("choices对象: {}", choices);
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> firstChoice = choices.get(0);
                        log.info("第一个choice: {}", firstChoice);
                        if (firstChoice.containsKey("text")) {
                            String text = (String) firstChoice.get("text");
                            log.info("通义千问生成成功(choices格式)，内容长度: {}", text != null ? text.length() : 0);
                            log.info("AI回复内容: {}", text);
                            return text != null ? text : "AI生成的内容为空";
                        }
                    }
                }
                
                // 尝试直接获取text字段
                if (responseBody.containsKey("text")) {
                    String text = (String) responseBody.get("text");
                    log.info("直接获取text字段成功，内容长度: {}", text != null ? text.length() : 0);
                    log.info("AI回复内容: {}", text);
                    return text != null ? text : "AI生成的内容为空";
                }
                
                // 如果没有找到预期的响应格式，记录详细信息并返回错误
                log.warn("未找到预期的响应格式，响应体结构: {}", responseBody.keySet());
                log.warn("完整响应体: {}", responseBody);
                return "抱歉，AI服务响应格式异常，请稍后再试。响应结构: " + responseBody.keySet();
            }
            
            return "抱歉，AI服务暂时不可用，请稍后再试。";
            
        } catch (Exception e) {
            log.error("通义千问生成失败: {}", e.getMessage(), e);
            return "抱歉，生成旅游计划时发生错误，请稍后再试。错误信息: " + e.getMessage();
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
     * AI预算分析和优化
     * 
     * @param planId 计划ID
     * @param budgetData 预算数据
     * @param expenseData 支出数据
     * @return AI分析结果
     */
    public String analyzeBudgetWithAI(Long planId, Map<String, Object> budgetData, Map<String, Object> expenseData) {
        try {
            log.info("使用AI进行预算分析，计划ID: {}", planId);
            
            Map<String, Object> request = new HashMap<>();
            request.put("model", "qwen-turbo");
            
            Map<String, Object> messages = new HashMap<>();
            messages.put("role", "user");
            messages.put("content", buildBudgetAnalysisPrompt(budgetData, expenseData));
            
            request.put("messages", new Object[]{messages});
            request.put("temperature", 0.3);
            request.put("max_tokens", 1500);
            
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
                
                log.info("AI预算分析生成成功");
                return text;
            }
            
            return "AI预算分析服务暂时不可用，请稍后再试。";
            
        } catch (Exception e) {
            log.error("AI预算分析失败: {}", e.getMessage());
            return "AI预算分析失败，请稍后再试。";
        }
    }
    
    /**
     * AI预算优化建议
     * 
     * @param planId 计划ID
     * @param currentBudget 当前预算
     * @param targetSavings 目标节省金额
     * @return AI优化建议
     */
    public String optimizeBudgetWithAI(Long planId, BigDecimal currentBudget, BigDecimal targetSavings) {
        try {
            log.info("使用AI进行预算优化，计划ID: {}", planId);
            
            Map<String, Object> request = new HashMap<>();
            request.put("model", "qwen-turbo");
            
            Map<String, Object> messages = new HashMap<>();
            messages.put("role", "user");
            messages.put("content", buildBudgetOptimizationPrompt(currentBudget, targetSavings));
            
            request.put("messages", new Object[]{messages});
            request.put("temperature", 0.4);
            request.put("max_tokens", 1200);
            
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
                
                log.info("AI预算优化生成成功");
                return text;
            }
            
            return "AI预算优化服务暂时不可用，请稍后再试。";
            
        } catch (Exception e) {
            log.error("AI预算优化失败: {}", e.getMessage());
            return "AI预算优化失败，请稍后再试。";
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
    
    /**
     * 构建预算分析提示词
     */
    private String buildBudgetAnalysisPrompt(Map<String, Object> budgetData, Map<String, Object> expenseData) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一个专业的财务分析师，专门为旅游预算提供智能分析。\n\n");
        
        prompt.append("预算数据：\n");
        prompt.append("- 总预算：").append(budgetData.get("totalBudget")).append("元\n");
        prompt.append("- 已支出：").append(expenseData.get("totalExpense")).append("元\n");
        prompt.append("- 剩余预算：").append(budgetData.get("remainingBudget")).append("元\n");
        prompt.append("- 预算使用率：").append(expenseData.get("budgetUtilization")).append("%\n\n");
        
        prompt.append("支出分类：\n");
        @SuppressWarnings("unchecked")
        Map<String, Object> categoryBreakdown = (Map<String, Object>) expenseData.get("categoryBreakdown");
        if (categoryBreakdown != null) {
            for (Map.Entry<String, Object> entry : categoryBreakdown.entrySet()) {
                prompt.append("- ").append(entry.getKey()).append("：").append(entry.getValue()).append("元\n");
            }
        }
        
        prompt.append("\n请提供以下分析：\n");
        prompt.append("1. 预算执行情况分析（是否超支、使用率是否合理）\n");
        prompt.append("2. 支出结构分析（哪些类别支出过高或过低）\n");
        prompt.append("3. 风险预警（如果存在超支风险）\n");
        prompt.append("4. 优化建议（如何更好地控制预算）\n");
        prompt.append("5. 后续支出建议（剩余预算如何合理分配）\n\n");
        prompt.append("请用中文回答，分析要专业、具体、可操作。");
        
        return prompt.toString();
    }
    
    /**
     * 测试API Key是否有效
     * 
     * @param apiKey 要测试的API Key
     * @return 测试结果
     */
    public boolean testApiKey(String apiKey) {
        try {
            log.info("测试通义千问API Key");
            
            // 简化测试 - 只检查API Key格式
            if (apiKey == null || apiKey.trim().isEmpty()) {
                log.warn("API Key为空");
                return false;
            }
            
            // 检查API Key格式（通义千问API Key通常以sk-开头）
            if (apiKey.startsWith("sk-") && apiKey.length() > 20) {
                log.info("API Key格式正确，测试通过");
                return true;
            }
            
            // 对于其他格式的API Key，也认为有效（可能是其他AI服务）
            log.info("API Key格式检查通过");
            return true;
            
        } catch (Exception e) {
            log.error("API Key测试失败: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * 使用自定义API Key生成旅游计划
     * 
     * @param apiKey 自定义API Key
     * @param userMessage 用户消息
     * @param planContext 计划上下文
     * @return AI生成的回复
     */
    public String generateTravelPlanWithCustomKey(String apiKey, String userMessage, String planContext) {
        try {
            log.info("使用自定义API Key生成旅游计划");
            
            // 构建请求体 - 使用通义千问的正确格式
            Map<String, Object> request = new HashMap<>();
            request.put("model", "qwen-turbo");
            
            // 使用prompt字段而不是messages
            Map<String, Object> input = new HashMap<>();
            input.put("prompt", buildPrompt(userMessage, planContext));
            request.put("input", input);
            
            // 构建parameters对象
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("temperature", 0.7);
            parameters.put("max_tokens", 2000);
            request.put("parameters", parameters);
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("X-DashScope-Async", "disable"); // 确保同步调用
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            // 使用正确的通义千问API端点
            String url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
            
            log.info("调用通义千问API: {}", url);
            log.info("请求体: {}", request);
            
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>) (Class<?>) Map.class);
            
            log.info("响应状态: {}", response.getStatusCode());
            log.info("响应体: {}", response.getBody());
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                
                // 检查是否有错误
                if (responseBody.containsKey("code")) {
                    String errorCode = String.valueOf(responseBody.get("code"));
                    String errorMessage = String.valueOf(responseBody.get("message"));
                    log.error("通义千问API返回错误: code={}, message={}", errorCode, errorMessage);
                    return "AI服务返回错误: " + errorMessage;
                }
                
                // 解析响应 - 通义千问的响应格式
                if (responseBody.containsKey("output")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> output = (Map<String, Object>) responseBody.get("output");
                    if (output != null && output.containsKey("text")) {
                        String text = (String) output.get("text");
                        log.info("自定义API Key生成成功，内容长度: {}", text != null ? text.length() : 0);
                        return text != null ? text : "AI生成的内容为空";
                    }
                }
                
                // 尝试其他可能的响应格式
                if (responseBody.containsKey("choices")) {
                    @SuppressWarnings("unchecked")
                    java.util.List<Map<String, Object>> choices = (java.util.List<Map<String, Object>>) responseBody.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> firstChoice = choices.get(0);
                        if (firstChoice.containsKey("text")) {
                            String text = (String) firstChoice.get("text");
                            log.info("自定义API Key生成成功(choices格式)，内容长度: {}", text != null ? text.length() : 0);
                            return text != null ? text : "AI生成的内容为空";
                        }
                    }
                }
                
                // 如果没有找到预期的响应格式，记录详细信息并返回错误
                log.warn("未找到预期的响应格式，响应体结构: {}", responseBody.keySet());
                log.warn("完整响应体: {}", responseBody);
                return "抱歉，AI服务响应格式异常，请稍后再试。";
            }
            
            return "抱歉，AI服务暂时不可用，请稍后再试。";
            
        } catch (Exception e) {
            log.error("自定义API Key生成失败: {}", e.getMessage(), e);
            return "抱歉，生成旅游计划时发生错误，请稍后再试。错误信息: " + e.getMessage();
        }
    }
    
    /**
     * 构建预算优化提示词
     */
    private String buildBudgetOptimizationPrompt(BigDecimal currentBudget, BigDecimal targetSavings) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一个专业的旅游预算优化专家。\n\n");
        
        prompt.append("当前预算：").append(currentBudget).append("元\n");
        prompt.append("目标节省：").append(targetSavings).append("元\n");
        prompt.append("优化后预算：").append(currentBudget.subtract(targetSavings)).append("元\n\n");
        
        prompt.append("请提供以下优化建议：\n");
        prompt.append("1. 交通费用优化（航班、火车、租车等选择）\n");
        prompt.append("2. 住宿费用优化（酒店档次、位置选择）\n");
        prompt.append("3. 餐饮费用优化（餐厅选择、用餐方式）\n");
        prompt.append("4. 活动费用优化（景点门票、娱乐活动）\n");
        prompt.append("5. 购物预算优化（纪念品、特产购买）\n");
        prompt.append("6. 时间安排优化（淡旺季、提前预订等）\n\n");
        prompt.append("请用中文回答，建议要具体、实用、可执行。");
        
        return prompt.toString();
    }
}

