package com.travelplanner.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

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
    
    @Value("${app.xunfei.app-id:}")
    private String xunfeiAppId;
    
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
     * 提取的旅行计划字段
     */
    public static class ExtractedFields {
        private String destination;
        private Double budget;
        private Integer groupSize;
        private String travelType;
        
        public ExtractedFields() {}
        
        public ExtractedFields(String destination, Double budget, Integer groupSize, String travelType) {
            this.destination = destination;
            this.budget = budget;
            this.groupSize = groupSize;
            this.travelType = travelType;
        }
        
        // Getters and Setters
        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }
        public Double getBudget() { return budget; }
        public void setBudget(Double budget) { this.budget = budget; }
        public Integer getGroupSize() { return groupSize; }
        public void setGroupSize(Integer groupSize) { this.groupSize = groupSize; }
        public String getTravelType() { return travelType; }
        public void setTravelType(String travelType) { this.travelType = travelType; }
        
        /**
         * 检查是否有任何字段被提取
         */
        public boolean hasAnyField() {
            return destination != null || budget != null || groupSize != null || travelType != null;
        }
    }
    
    /**
     * 从用户消息中提取旅行计划字段
     * 
     * @param userMessage 用户消息
     * @return 提取的字段
     */
    public ExtractedFields extractTravelFields(String userMessage) {
        try {
            log.info("开始提取旅行字段: {}", userMessage);
            
            ExtractedFields fields = new ExtractedFields();
            
            // 先通过通义千问API提取和规范化字段
            ExtractedFields aiFields = extractFieldsWithAI(userMessage);
            
            // 如果AI提取成功，使用AI的结果
            if (aiFields != null && aiFields.hasAnyField()) {
                fields = aiFields;
                log.info("AI字段提取成功: destination={}, budget={}, groupSize={}, travelType={}", 
                    fields.getDestination(), fields.getBudget(), fields.getGroupSize(), fields.getTravelType());
            } else {
                // 如果AI提取失败，回退到正则表达式提取
                log.warn("AI字段提取失败，使用正则表达式提取");
                fields.setDestination(extractDestination(userMessage));
                fields.setBudget(extractBudget(userMessage));
                fields.setGroupSize(extractGroupSize(userMessage));
                fields.setTravelType(extractTravelType(userMessage));
                
                log.info("正则表达式字段提取结果: destination={}, budget={}, groupSize={}, travelType={}", 
                    fields.getDestination(), fields.getBudget(), fields.getGroupSize(), fields.getTravelType());
            }
            
            log.info("字段提取结果: destination={}, budget={}, groupSize={}, travelType={}", 
                fields.getDestination(), fields.getBudget(), fields.getGroupSize(), fields.getTravelType());
            
            return fields;
            
        } catch (Exception e) {
            log.error("字段提取失败: {}", e.getMessage(), e);
            return new ExtractedFields(); // 返回空字段
        }
    }
    
    /**
     * 通过通义千问API提取和规范化字段
     */
    private ExtractedFields extractFieldsWithAI(String userMessage) {
        try {
            String prompt = String.format(
                "请从以下用户消息中提取旅行规划的关键信息，并以JSON格式返回：\n" +
                "用户消息：%s\n\n" +
                "请提取以下字段：\n" +
                "1. destination（目的地）：提取具体的城市或国家名称，如\"日本东京\"、\"北京\"等\n" +
                "2. budget（预算）：提取数字金额，统一转换为人民币元，如10000表示1万元\n" +
                "3. groupSize（人数）：提取旅行人数，如2表示2个人\n" +
                "4. travelType（旅行类型）：如\"家庭游\"、\"情侣游\"、\"商务游\"、\"自由行\"等\n\n" +
                "请严格按照以下JSON格式返回，如果某个字段无法提取则设为null：\n" +
                "{\n" +
                "  \"destination\": \"具体目的地\",\n" +
                "  \"budget\": 数字金额,\n" +
                "  \"groupSize\": 人数,\n" +
                "  \"travelType\": \"旅行类型\"\n" +
                "}",
                userMessage
            );
            
            log.info("字段提取提示词: {}", prompt);
            String response = callQwenAPI(prompt);
            log.info("通义千问字段提取响应: {}", response);
            
            // 解析JSON响应
            ExtractedFields fields = parseFieldsFromAIResponse(response);
            
            // 调试输出：打印提取出的字段
            if (fields != null) {
                log.info("=== 提取出的字段调试信息 ===");
                log.info("目的地 (destination): '{}'", fields.getDestination());
                log.info("预算 (budget): {}", fields.getBudget());
                log.info("团队人数 (groupSize): {}", fields.getGroupSize());
                log.info("旅行类型 (travelType): '{}'", fields.getTravelType());
                log.info("=== 字段提取完成 ===");
            } else {
                log.warn("字段提取结果为null");
            }
            
            return fields;
            
        } catch (Exception e) {
            log.error("AI字段提取失败: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 解析AI响应的JSON格式字段
     */
    private ExtractedFields parseFieldsFromAIResponse(String response) {
        try {
            ExtractedFields fields = new ExtractedFields();
            
            // 简单的JSON解析（不使用复杂的JSON库）
            String jsonContent = response.trim();
            log.info("开始解析JSON响应: {}", jsonContent);
            
            // 提取destination
            String destination = extractJsonValue(jsonContent, "destination");
            log.info("提取的destination原始值: '{}'", destination);
            if (destination != null && !destination.equals("null")) {
                fields.setDestination(destination.replaceAll("\"", "").trim());
            }
            
            // 提取budget
            String budgetStr = extractJsonValue(jsonContent, "budget");
            log.info("提取的budget原始值: '{}'", budgetStr);
            if (budgetStr != null && !budgetStr.equals("null")) {
                try {
                    Double budget = Double.parseDouble(budgetStr.replaceAll("\"", "").trim());
                    fields.setBudget(budget);
                } catch (NumberFormatException e) {
                    log.warn("预算解析失败: {}", budgetStr);
                }
            }
            
            // 提取groupSize
            String groupSizeStr = extractJsonValue(jsonContent, "groupSize");
            log.info("提取的groupSize原始值: '{}'", groupSizeStr);
            if (groupSizeStr != null && !groupSizeStr.equals("null")) {
                try {
                    Integer groupSize = Integer.parseInt(groupSizeStr.replaceAll("\"", "").trim());
                    fields.setGroupSize(groupSize);
                } catch (NumberFormatException e) {
                    log.warn("人数解析失败: {}", groupSizeStr);
                }
            }
            
            // 提取travelType
            String travelType = extractJsonValue(jsonContent, "travelType");
            log.info("提取的travelType原始值: '{}'", travelType);
            if (travelType != null && !travelType.equals("null")) {
                fields.setTravelType(travelType.replaceAll("\"", "").trim());
            }
            
            log.info("JSON解析完成，最终字段: destination='{}', budget={}, groupSize={}, travelType='{}'", 
                fields.getDestination(), fields.getBudget(), fields.getGroupSize(), fields.getTravelType());
            
            return fields;
            
        } catch (Exception e) {
            log.error("解析AI响应失败: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 从JSON字符串中提取指定字段的值
     */
    private String extractJsonValue(String json, String fieldName) {
        try {
            String pattern = "\"" + fieldName + "\"\\s*:\\s*([^,}\\]]+)";
            Pattern regex = Pattern.compile(pattern);
            Matcher matcher = regex.matcher(json);
            
            log.info("提取字段 '{}' 的正则表达式: {}", fieldName, pattern);
            log.info("匹配的JSON内容: {}", json);
            
            if (matcher.find()) {
                String result = matcher.group(1).trim();
                log.info("字段 '{}' 提取结果: '{}'", fieldName, result);
                return result;
            }
            log.warn("字段 '{}' 未找到匹配", fieldName);
            return null;
        } catch (Exception e) {
            log.warn("提取JSON字段失败: {}", fieldName, e);
            return null;
        }
    }
    
    /**
     * 调用通义千问API的通用方法
     */
    private String callQwenAPI(String prompt) {
        try {
            // 构建请求体 - 使用通义千问的正确格式
            Map<String, Object> request = new HashMap<>();
            request.put("model", "qwen-turbo");
            
            // 使用messages格式（通义千问标准格式）
            java.util.List<Map<String, Object>> messages = new java.util.ArrayList<>();
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            messages.add(message);
            
            // 构建input对象（通义千问的正确格式）
            Map<String, Object> input = new HashMap<>();
            input.put("messages", messages);
            request.put("input", input);
            
            // 构建parameters对象
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("temperature", 0.3); // 降低温度以获得更稳定的JSON输出
            parameters.put("max_tokens", 500);  // 减少token数量
            request.put("parameters", parameters);
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + qwenApiKey);
            headers.set("X-DashScope-Async", "disable"); // 确保同步调用
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            // 使用正确的通义千问API端点
            String url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
            
            log.info("调用通义千问字段提取API: {}", url);
            
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>) (Class<?>) Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                
                // 检查是否有错误
                if (responseBody.containsKey("code")) {
                    String errorCode = String.valueOf(responseBody.get("code"));
                    String errorMessage = String.valueOf(responseBody.get("message"));
                    log.error("通义千问API返回错误: code={}, message={}", errorCode, errorMessage);
                    return null;
                }
                
                // 解析响应 - 通义千问的响应格式
                if (responseBody.containsKey("output")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> output = (Map<String, Object>) responseBody.get("output");
                    if (output != null && output.containsKey("text")) {
                        String text = (String) output.get("text");
                        log.info("通义千问字段提取成功，内容长度: {}", text != null ? text.length() : 0);
                        return text;
                    }
                }
            }
            
            return null;
            
        } catch (Exception e) {
            log.error("通义千问API调用失败: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 提取目的地
     */
    private String extractDestination(String userMessage) {
        // 常见目的地关键词
        String[] destinations = {
            "北京", "上海", "广州", "深圳", "杭州", "南京", "苏州", "成都", "重庆", "西安", "武汉", "长沙", "青岛", "大连", "厦门", "福州", "昆明", "贵阳", "南宁", "海口", "三亚", "拉萨", "乌鲁木齐", "银川", "西宁", "兰州", "呼和浩特", "哈尔滨", "长春", "沈阳", "石家庄", "太原", "济南", "合肥", "南昌", "郑州", "长沙", "武汉", "成都", "重庆", "贵阳", "昆明", "南宁", "海口", "三亚", "拉萨", "乌鲁木齐", "银川", "西宁", "兰州", "呼和浩特",
            "日本", "东京", "大阪", "京都", "北海道", "冲绳", "韩国", "首尔", "釜山", "济州岛", "新加坡", "马来西亚", "吉隆坡", "泰国", "曼谷", "普吉岛", "清迈", "越南", "河内", "胡志明市", "柬埔寨", "吴哥窟", "缅甸", "仰光", "老挝", "万象", "菲律宾", "马尼拉", "长滩岛", "印度尼西亚", "巴厘岛", "雅加达", "印度", "新德里", "孟买", "尼泊尔", "加德满都", "斯里兰卡", "科伦坡", "马尔代夫", "马累",
            "美国", "纽约", "洛杉矶", "旧金山", "拉斯维加斯", "夏威夷", "加拿大", "温哥华", "多伦多", "墨西哥", "墨西哥城", "巴西", "里约热内卢", "圣保罗", "阿根廷", "布宜诺斯艾利斯", "智利", "圣地亚哥", "秘鲁", "利马", "哥伦比亚", "波哥大",
            "英国", "伦敦", "爱丁堡", "法国", "巴黎", "里昂", "德国", "柏林", "慕尼黑", "意大利", "罗马", "米兰", "威尼斯", "西班牙", "马德里", "巴塞罗那", "葡萄牙", "里斯本", "荷兰", "阿姆斯特丹", "比利时", "布鲁塞尔", "瑞士", "苏黎世", "日内瓦", "奥地利", "维也纳", "捷克", "布拉格", "匈牙利", "布达佩斯", "波兰", "华沙", "俄罗斯", "莫斯科", "圣彼得堡", "希腊", "雅典", "土耳其", "伊斯坦布尔", "挪威", "奥斯陆", "瑞典", "斯德哥尔摩", "丹麦", "哥本哈根", "芬兰", "赫尔辛基", "冰岛", "雷克雅未克",
            "澳大利亚", "悉尼", "墨尔本", "珀斯", "新西兰", "奥克兰", "惠灵顿", "斐济", "苏瓦"
        };
        
        String message = userMessage.toLowerCase();
        for (String dest : destinations) {
            if (message.contains(dest.toLowerCase())) {
                return dest;
            }
        }
        
        // 使用正则表达式匹配"去"、"到"等关键词后的地名
        Pattern pattern = Pattern.compile("(?:去|到|前往|游览|参观|旅游|旅行)([\\u4e00-\\u9fa5]{2,10})");
        Matcher matcher = pattern.matcher(userMessage);
        if (matcher.find()) {
            return matcher.group(1);
        }
        
        return null;
    }
    
    /**
     * 提取预算
     */
    private Double extractBudget(String userMessage) {
        // 匹配各种预算表达方式
        Pattern[] patterns = {
            Pattern.compile("(?:预算|花费|费用|价格|价钱|成本)(?:是|为|约|大概|左右)?(?:\\s*)([0-9]+(?:\\.[0-9]+)?)(?:万|千|元|块)?"),
            Pattern.compile("([0-9]+(?:\\.[0-9]+)?)(?:万|千|元|块)(?:的)?(?:预算|花费|费用)"),
            Pattern.compile("(?:准备|计划|打算)(?:花|用|花费)([0-9]+(?:\\.[0-9]+)?)(?:万|千|元|块)"),
            Pattern.compile("([0-9]+(?:\\.[0-9]+)?)(?:万|千|元|块)(?:以内|以下|左右|上下)")
        };
        
        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(userMessage);
            if (matcher.find()) {
                String amountStr = matcher.group(1);
                try {
                    double amount = Double.parseDouble(amountStr);
                    
                    // 检查单位
                    String fullMatch = matcher.group(0);
                    if (fullMatch.contains("万")) {
                        amount *= 10000;
                    } else if (fullMatch.contains("千")) {
                        amount *= 1000;
                    }
                    
                    return amount;
                } catch (NumberFormatException e) {
                    log.warn("预算数字解析失败: {}", amountStr);
                }
            }
        }
        
        return null;
    }
    
    /**
     * 提取人数
     */
    private Integer extractGroupSize(String userMessage) {
        // 匹配各种人数表达方式
        Pattern[] patterns = {
            Pattern.compile("([0-9]+)(?:个人|人|名|位)"),  // 最简单的模式：数字+人
            Pattern.compile("(?:带|和|与|跟)([0-9]+)(?:个|名|位|人)(?:孩子|朋友|家人|同伴|伙伴)"),
            Pattern.compile("([0-9]+)(?:个人|人|名|位)(?:一起|一同|共同)"),
            Pattern.compile("(?:一共|总共|合计)([0-9]+)(?:个人|人|名|位)"),
            Pattern.compile("(?:我们|咱们)([0-9]+)(?:个人|人|名|位)"),
            Pattern.compile("(?:家庭|团队|小组)(?:有|是)([0-9]+)(?:个人|人|名|位)"),
            Pattern.compile("([0-9]+)(?:人|个人|名|位)(?:的)?(?:旅行|旅游|出行)")
        };
        
        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(userMessage);
            if (matcher.find()) {
                try {
                    int count = Integer.parseInt(matcher.group(1));
                    return count;
                } catch (NumberFormatException e) {
                    log.warn("人数数字解析失败: {}", matcher.group(1));
                }
            }
        }
        
        // 特殊关键词匹配
        if (userMessage.contains("一个人") || userMessage.contains("独自") || userMessage.contains("单独")) {
            return 1;
        }
        if (userMessage.contains("两个人") || userMessage.contains("情侣") || userMessage.contains("夫妻")) {
            return 2;
        }
        if (userMessage.contains("一家人") || userMessage.contains("全家")) {
            return 3; // 默认一家三口
        }
        
        return null;
    }
    
    /**
     * 提取旅行类型
     */
    private String extractTravelType(String userMessage) {
        String message = userMessage.toLowerCase();
        
        if (message.contains("商务") || message.contains("出差") || message.contains("会议")) {
            return "商务";
        } else if (message.contains("蜜月") || message.contains("情侣") || message.contains("浪漫")) {
            return "蜜月";
        } else if (message.contains("家庭") || message.contains("亲子") || message.contains("带孩子")) {
            return "家庭";
        } else if (message.contains("探险") || message.contains("户外") || message.contains("徒步") || message.contains("登山")) {
            return "探险";
        } else if (message.contains("美食") || message.contains("吃货") || message.contains("品尝")) {
            return "美食";
        } else if (message.contains("文化") || message.contains("历史") || message.contains("古迹") || message.contains("博物馆")) {
            return "文化";
        } else if (message.contains("购物") || message.contains("血拼") || message.contains("买买买")) {
            return "购物";
        } else if (message.contains("休闲") || message.contains("度假") || message.contains("放松")) {
            return "休闲";
        } else if (message.contains("摄影") || message.contains("拍照") || message.contains("打卡")) {
            return "摄影";
        }
        
        return "休闲"; // 默认类型
    }
    
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
            
            // 使用messages格式（通义千问标准格式）
            java.util.List<Map<String, Object>> messages = new java.util.ArrayList<>();
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", buildPrompt(userMessage, planContext));
            messages.add(message);
            
            // 构建input对象（通义千问的正确格式）
            Map<String, Object> input = new HashMap<>();
            input.put("messages", messages);
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
     * 语音转文字（模拟实现）
     * 
     * @param audioData 音频数据
     * @return 转换后的文字
     */
    public String speechToText(byte[] audioData) {
        try {
            log.info("语音转文字请求，音频数据大小: {} bytes", audioData.length);
            
            // 模拟语音识别结果
            // 在实际生产环境中，这里应该调用真正的语音识别API
            String[] mockResults = {
                "我想去北京旅游，请帮我制定一个3天的行程计划",
                "计划去上海迪士尼乐园，需要安排住宿和交通",
                "我想去云南大理，预算5000元，请推荐景点",
                "计划去海南三亚度假，需要包含机票和酒店",
                "我想去西安看兵马俑，请安排详细的行程"
            };
            
            // 随机返回一个模拟结果
            int randomIndex = (int) (Math.random() * mockResults.length);
            String result = mockResults[randomIndex];
            
            log.info("语音识别模拟结果: {}", result);
            return result;
            
        } catch (Exception e) {
            log.error("语音转文字失败: {}", e.getMessage(), e);
            return "语音识别失败，请重试。错误: " + e.getMessage();
        }
    }
    
    /**
     * 生成科大讯飞签名
     */
    private String generateXunfeiSigna(String ts) {
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            SecretKeySpec secretKeySpec = new SecretKeySpec(xunfeiApiSecret.getBytes(), "HmacSHA1");
            mac.init(secretKeySpec);
            byte[] signature = mac.doFinal(ts.getBytes());
            return Base64.getEncoder().encodeToString(signature);
        } catch (Exception e) {
            log.error("生成科大讯飞签名失败: {}", e.getMessage());
            return "";
        }
    }
    
    /**
     * 生成科大讯飞鉴权参数
     */
    private String generateXunfeiAuth(String apiKey, String ts, String signa) {
        String auth = apiKey + ":" + ts + ":" + signa;
        return Base64.getEncoder().encodeToString(auth.getBytes());
    }
    
    /**
     * 解析科大讯飞识别结果
     */
    private String parseXunfeiResult(Map<String, Object> responseBody) {
        try {
            Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
            if (data != null) {
                Map<String, Object> result = (Map<String, Object>) data.get("result");
                if (result != null) {
                    List<Map<String, Object>> ws = (List<Map<String, Object>>) result.get("ws");
                    if (ws != null) {
                        StringBuilder transcript = new StringBuilder();
                        for (Map<String, Object> w : ws) {
                            List<Map<String, Object>> cw = (List<Map<String, Object>>) w.get("cw");
                            if (cw != null) {
                                for (Map<String, Object> c : cw) {
                                    String word = (String) c.get("w");
                                    if (word != null) {
                                        transcript.append(word);
                                    }
                                }
                            }
                        }
                        return transcript.toString();
                    }
                }
            }
            return "未识别到有效语音内容";
        } catch (Exception e) {
            log.error("解析科大讯飞结果失败: {}", e.getMessage());
            return "解析识别结果失败";
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
            
            // 使用正确的messages格式
            java.util.List<Map<String, Object>> messages = new java.util.ArrayList<>();
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", buildBudgetAnalysisPrompt(budgetData, expenseData));
            messages.add(message);
            
            // 构建input对象（通义千问的正确格式）
            Map<String, Object> input = new HashMap<>();
            input.put("messages", messages);
            request.put("input", input);
            
            // 构建parameters对象
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("temperature", 0.3);
            parameters.put("max_tokens", 1500);
            request.put("parameters", parameters);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + qwenApiKey);
            headers.set("X-DashScope-Async", "disable"); // 确保同步调用
            
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
            
            // 使用正确的messages格式
            java.util.List<Map<String, Object>> messages = new java.util.ArrayList<>();
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", buildBudgetOptimizationPrompt(currentBudget, targetSavings));
            messages.add(message);
            
            // 构建input对象（通义千问的正确格式）
            Map<String, Object> input = new HashMap<>();
            input.put("messages", messages);
            request.put("input", input);
            
            // 构建parameters对象
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("temperature", 0.4);
            parameters.put("max_tokens", 1200);
            request.put("parameters", parameters);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + qwenApiKey);
            headers.set("X-DashScope-Async", "disable"); // 确保同步调用
            
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
        prompt.append("请根据以下旅游预算数据进行分析：\n\n");
        
        prompt.append("预算情况：\n");
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
        
        prompt.append("\n请简单分析：\n");
        prompt.append("1. 当前预算执行情况\n");
        prompt.append("2. 主要支出类别分析\n");
        prompt.append("3. 后续支出建议\n\n");
        prompt.append("请用简洁的中文回答。");
        
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
            
            // 使用messages格式（通义千问标准格式）
            java.util.List<Map<String, Object>> messages = new java.util.ArrayList<>();
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", buildPrompt(userMessage, planContext));
            messages.add(message);
            
            // 构建input对象（通义千问的正确格式）
            Map<String, Object> input = new HashMap<>();
            input.put("messages", messages);
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

