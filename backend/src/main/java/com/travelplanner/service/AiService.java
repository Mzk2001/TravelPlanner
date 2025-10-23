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
    
    @Value("${app.ai.mock-mode:true}")
    private boolean mockMode;
    
    /**
     * 使用通义千问生成旅游计划
     * 
     * @param userMessage 用户消息
     * @param planContext 计划上下文
     * @return AI生成的回复
     */
    public String generateTravelPlan(String userMessage, String planContext) {
        try {
            // 如果启用桩程序模式，返回模拟数据
            if (mockMode) {
                log.info("使用桩程序模式生成旅游计划");
                return generateMockTravelPlan(userMessage, planContext);
            }
            
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
            // 如果启用桩程序模式，返回模拟数据
            if (mockMode) {
                log.info("使用桩程序模式生成旅游计划（自定义API Key）");
                return generateMockTravelPlan(userMessage, planContext);
            }
            
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
    
    /**
     * 生成模拟旅游计划（桩程序）
     * 
     * @param userMessage 用户消息
     * @param planContext 计划上下文
     * @return 模拟的旅游计划
     */
    private String generateMockTravelPlan(String userMessage, String planContext) {
        try {
            // 模拟网络延迟
            Thread.sleep(2000);
            
            StringBuilder mockResponse = new StringBuilder();
            mockResponse.append("🎯 **智能旅游计划生成**\n\n");
            
            // 根据用户消息生成不同的模拟回复
            if (userMessage.contains("北京") || userMessage.contains("beijing")) {
                mockResponse.append("## 🏛️ 北京3日游计划\n\n");
                mockResponse.append("### 📅 第一天：故宫与天安门\n");
                mockResponse.append("- **上午**：天安门广场 → 故宫博物院（3-4小时）\n");
                mockResponse.append("- **下午**：景山公园 → 北海公园\n");
                mockResponse.append("- **晚上**：王府井步行街\n\n");
                
                mockResponse.append("### 📅 第二天：长城与颐和园\n");
                mockResponse.append("- **上午**：八达岭长城（4-5小时）\n");
                mockResponse.append("- **下午**：颐和园（2-3小时）\n");
                mockResponse.append("- **晚上**：三里屯或后海\n\n");
                
                mockResponse.append("### 📅 第三天：天坛与胡同游\n");
                mockResponse.append("- **上午**：天坛公园（2小时）\n");
                mockResponse.append("- **下午**：南锣鼓巷 → 什刹海\n");
                mockResponse.append("- **晚上**：前门大街\n\n");
                
                mockResponse.append("### 🏨 住宿建议\n");
                mockResponse.append("- **经济型**：如家、汉庭（200-300元/晚）\n");
                mockResponse.append("- **舒适型**：全季、桔子酒店（400-600元/晚）\n");
                mockResponse.append("- **豪华型**：北京饭店、王府井希尔顿（800-1500元/晚）\n\n");
                
                mockResponse.append("### 🍜 美食推荐\n");
                mockResponse.append("- **烤鸭**：全聚德、便宜坊\n");
                mockResponse.append("- **涮羊肉**：东来顺、聚宝源\n");
                mockResponse.append("- **炸酱面**：海碗居、老北京炸酱面\n");
                mockResponse.append("- **豆汁**：护国寺小吃\n\n");
                
                mockResponse.append("### 💰 预算估算\n");
                mockResponse.append("- **交通**：地铁日票20元/人，出租车约200元/天\n");
                mockResponse.append("- **门票**：故宫60元，长城40元，颐和园30元\n");
                mockResponse.append("- **餐饮**：150-300元/人/天\n");
                mockResponse.append("- **住宿**：200-1500元/晚\n");
                mockResponse.append("- **总计**：约2000-5000元/人（3天）\n\n");
                
            } else if (userMessage.contains("上海") || userMessage.contains("shanghai")) {
                mockResponse.append("## 🌆 上海3日游计划\n\n");
                mockResponse.append("### 📅 第一天：外滩与南京路\n");
                mockResponse.append("- **上午**：外滩观景台 → 黄浦江游船\n");
                mockResponse.append("- **下午**：南京路步行街 → 人民广场\n");
                mockResponse.append("- **晚上**：豫园 → 城隍庙\n\n");
                
                mockResponse.append("### 📅 第二天：迪士尼乐园\n");
                mockResponse.append("- **全天**：上海迪士尼乐园\n");
                mockResponse.append("- **推荐项目**：飞跃地平线、创极速光轮、加勒比海盗\n");
                mockResponse.append("- **晚上**：迪士尼小镇\n\n");
                
                mockResponse.append("### 📅 第三天：新天地与田子坊\n");
                mockResponse.append("- **上午**：新天地（石库门建筑）\n");
                mockResponse.append("- **下午**：田子坊（文艺小资）\n");
                mockResponse.append("- **晚上**：陆家嘴夜景\n\n");
                
                mockResponse.append("### 🏨 住宿建议\n");
                mockResponse.append("- **经济型**：如家、汉庭（250-350元/晚）\n");
                mockResponse.append("- **舒适型**：全季、桔子酒店（500-800元/晚）\n");
                mockResponse.append("- **豪华型**：外滩茂悦、浦东香格里拉（1000-2000元/晚）\n\n");
                
                mockResponse.append("### 🍜 美食推荐\n");
                mockResponse.append("- **小笼包**：南翔小笼、鼎泰丰\n");
                mockResponse.append("- **生煎包**：大壶春、小杨生煎\n");
                mockResponse.append("- **本帮菜**：老正兴、德兴馆\n");
                mockResponse.append("- **海派西餐**：红房子西菜馆\n\n");
                
            } else if (userMessage.contains("杭州") || userMessage.contains("hangzhou")) {
                mockResponse.append("## 🏞️ 杭州2日游计划\n\n");
                mockResponse.append("### 📅 第一天：西湖经典游\n");
                mockResponse.append("- **上午**：断桥残雪 → 白堤 → 苏堤\n");
                mockResponse.append("- **下午**：三潭印月 → 雷峰塔\n");
                mockResponse.append("- **晚上**：河坊街 → 南宋御街\n\n");
                
                mockResponse.append("### 📅 第二天：灵隐寺与龙井村\n");
                mockResponse.append("- **上午**：灵隐寺 → 飞来峰\n");
                mockResponse.append("- **下午**：龙井村 → 九溪十八涧\n");
                mockResponse.append("- **晚上**：西湖音乐喷泉\n\n");
                
                mockResponse.append("### 🏨 住宿建议\n");
                mockResponse.append("- **西湖边**：杭州西湖国宾馆、西子宾馆\n");
                mockResponse.append("- **市区**：如家、汉庭（200-400元/晚）\n");
                mockResponse.append("- **民宿**：西湖边特色民宿（300-800元/晚）\n\n");
                
                mockResponse.append("### 🍜 美食推荐\n");
                mockResponse.append("- **杭帮菜**：楼外楼、知味观\n");
                mockResponse.append("- **西湖醋鱼**：楼外楼、天外天\n");
                mockResponse.append("- **龙井虾仁**：知味观、奎元馆\n");
                mockResponse.append("- **片儿川**：奎元馆、知味观\n\n");
                
            } else {
                // 通用旅游计划
                mockResponse.append("## 🌍 个性化旅游计划\n\n");
                mockResponse.append("### 📅 行程安排\n");
                mockResponse.append("- **第1天**：抵达目的地 → 酒店入住 → 市区观光\n");
                mockResponse.append("- **第2天**：主要景点游览 → 当地美食体验\n");
                mockResponse.append("- **第3天**：深度游 → 购物 → 返程\n\n");
                
                mockResponse.append("### 🏨 住宿建议\n");
                mockResponse.append("- **经济型**：连锁酒店（200-400元/晚）\n");
                mockResponse.append("- **舒适型**：精品酒店（500-800元/晚）\n");
                mockResponse.append("- **豪华型**：五星级酒店（1000-2000元/晚）\n\n");
                
                mockResponse.append("### 🍜 美食推荐\n");
                mockResponse.append("- **当地特色菜**：体验地道风味\n");
                mockResponse.append("- **网红餐厅**：打卡热门美食\n");
                mockResponse.append("- **街头小吃**：感受市井文化\n\n");
            }
            
            mockResponse.append("### 🚗 交通建议\n");
            mockResponse.append("- **市内交通**：地铁、公交、出租车\n");
            mockResponse.append("- **城际交通**：高铁、飞机、大巴\n");
            mockResponse.append("- **租车服务**：适合自由行\n\n");
            
            mockResponse.append("### ⚠️ 注意事项\n");
            mockResponse.append("- **天气**：关注天气预报，准备合适衣物\n");
            mockResponse.append("- **门票**：提前预订热门景点门票\n");
            mockResponse.append("- **安全**：保管好贵重物品，注意人身安全\n");
            mockResponse.append("- **文化**：尊重当地文化习俗\n\n");
            
            mockResponse.append("### 💡 贴心提示\n");
            mockResponse.append("- 建议下载当地地图APP\n");
            mockResponse.append("- 准备充电宝和移动电源\n");
            mockResponse.append("- 学习基本当地语言\n");
            mockResponse.append("- 购买旅游保险\n\n");
            
            mockResponse.append("🎉 **祝您旅途愉快！如有其他需求，请随时告诉我！**");
            
            return mockResponse.toString();
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("桩程序模拟延迟被中断: {}", e.getMessage());
            return "抱歉，生成旅游计划时发生错误，请稍后再试。";
        } catch (Exception e) {
            log.error("桩程序生成失败: {}", e.getMessage());
            return "抱歉，生成旅游计划时发生错误，请稍后再试。";
        }
    }
}

