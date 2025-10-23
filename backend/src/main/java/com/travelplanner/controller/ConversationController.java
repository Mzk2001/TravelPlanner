package com.travelplanner.controller;

import com.travelplanner.service.AiService;
import com.travelplanner.service.ConversationService;
import com.travelplanner.service.MapService;
import com.travelplanner.service.TravelPlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import com.travelplanner.util.MapUtils;
import com.travelplanner.entity.Conversation;

/**
 * 对话控制器 - 处理AI交互
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
@Slf4j
public class ConversationController {
    
    private final ConversationService conversationService;
    private final AiService aiService;
    private final MapService mapService;
    private final TravelPlanService travelPlanService;
    
    /**
     * 发送消息给AI
     * 
     * @param request 消息请求
     * @return AI回复
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chat(@Valid @RequestBody ChatRequest request) {
        try {
            log.info("收到聊天请求: userId={}, planId={}, apiKey={}", 
                request.getUserId(), request.getPlanId(), 
                request.getApiKey() != null ? "已提供" : "未提供");
            
            long startTime = System.currentTimeMillis();
            
            // 获取计划上下文
            String planContext = "";
            if (request.getPlanId() != null) {
                planContext = travelPlanService.findById(request.getPlanId())
                        .map(plan -> String.format("计划名称: %s, 目的地: %s, 预算: %s, 人数: %s", 
                                plan.getPlanName(), plan.getDestination(), 
                                plan.getBudget(), plan.getGroupSize()))
                        .orElse("");
            }
            
            // 调用AI服务生成回复
            String aiResponse;
            if (request.getApiKey() != null && !request.getApiKey().trim().isEmpty()) {
                // 使用自定义API Key
                aiResponse = aiService.generateTravelPlanWithCustomKey(
                    request.getApiKey(), 
                    request.getMessage(), 
                    planContext
                );
            } else {
                // 使用默认API Key
                aiResponse = aiService.generateTravelPlan(request.getMessage(), planContext);
            }
            
            long processingTime = System.currentTimeMillis() - startTime;
            
            // 保存对话记录
            conversationService.saveConversation(
                request.getUserId(),
                request.getPlanId(),
                request.getMessage(),
                aiResponse,
                "text",
                null,
                processingTime
            );
            
            // 不再自动创建旅游计划，改为用户手动选择保存
            Long createdPlanId = null;
            
            // 构建响应
            ChatResponse response = new ChatResponse();
            response.setMessage(aiResponse);
            response.setProcessingTime(processingTime);
            response.setTimestamp(LocalDateTime.now().toString());
            response.setCreatedPlanId(createdPlanId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("聊天处理失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", "处理消息时发生错误"));
        }
    }
    
    /**
     * 语音消息处理
     * 
     * @param userId 用户ID
     * @param planId 计划ID
     * @param audioFile 音频文件
     * @return AI回复
     */
    @PostMapping("/voice")
    public ResponseEntity<?> voiceChat(@RequestParam Long userId,
                                      @RequestParam(required = false) Long planId,
                                      @RequestParam("audio") MultipartFile audioFile) {
        try {
            log.info("收到语音消息: userId={}, planId={}", userId, planId);
            
            long startTime = System.currentTimeMillis();
            
            // 语音转文字
            byte[] audioData = audioFile.getBytes();
            String userMessage = aiService.speechToText(audioData);
            
            if (userMessage == null || userMessage.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(MapUtils.of("error", "语音识别失败"));
            }
            
            // 获取计划上下文
            String planContext = "";
            if (planId != null) {
                planContext = travelPlanService.findById(planId)
                        .map(plan -> String.format("计划名称: %s, 目的地: %s, 预算: %s, 人数: %s", 
                                plan.getPlanName(), plan.getDestination(), 
                                plan.getBudget(), plan.getGroupSize()))
                        .orElse("");
            }
            
            // 调用AI服务生成回复
            String aiResponse = aiService.generateTravelPlan(userMessage, planContext);
            
            // 文字转语音
            String voiceFileUrl = aiService.textToSpeech(aiResponse);
            
            long processingTime = System.currentTimeMillis() - startTime;
            
            // 保存对话记录
            conversationService.saveConversation(
                userId,
                planId,
                userMessage,
                aiResponse,
                "voice",
                voiceFileUrl,
                processingTime
            );
            
            // 构建响应
            VoiceChatResponse response = new VoiceChatResponse();
            response.setUserMessage(userMessage);
            response.setAiResponse(aiResponse);
            response.setVoiceFileUrl(voiceFileUrl);
            response.setProcessingTime(processingTime);
            response.setTimestamp(LocalDateTime.now().toString());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("语音聊天处理失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", "处理语音消息时发生错误"));
        }
    }
    
    /**
     * 获取对话历史
     * 
     * @param userId 用户ID
     * @param planId 计划ID（可选）
     * @param page 页码
     * @param size 每页大小
     * @return 对话历史
     */
    @GetMapping
    public ResponseEntity<?> getConversations(@RequestParam Long userId,
                                            @RequestParam(required = false) Long planId,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<com.travelplanner.entity.Conversation> conversations;
            
            if (planId != null) {
                conversations = conversationService.findByUserIdAndPlanId(userId, planId, pageable);
            } else {
                conversations = conversationService.findByUserId(userId, pageable);
            }
            
            return ResponseEntity.ok(conversations.map(this::convertToResponse));
            
        } catch (Exception e) {
            log.error("获取对话历史失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", "获取对话历史失败"));
        }
    }
    
    /**
     * 搜索地点
     * 
     * @param keyword 搜索关键词
     * @param city 城市（可选）
     * @return 搜索结果
     */
    @GetMapping("/search/places")
    public ResponseEntity<?> searchPlaces(@RequestParam String keyword,
                                        @RequestParam(required = false) String city) {
        try {
            log.info("搜索地点: keyword={}, city={}", keyword, city);
            
            Map<String, Object> result = mapService.searchPlace(keyword, city);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("搜索地点失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", "搜索地点失败"));
        }
    }
    
    /**
     * 获取地点详情
     * 
     * @param placeId 地点ID
     * @return 地点详情
     */
    @GetMapping("/places/{placeId}")
    public ResponseEntity<?> getPlaceDetail(@PathVariable String placeId) {
        try {
            log.info("获取地点详情: placeId={}", placeId);
            
            Map<String, Object> result = mapService.getPlaceDetail(placeId);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("获取地点详情失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", "获取地点详情失败"));
        }
    }
    
    /**
     * 判断AI回复是否为旅游计划生成
     */
    private boolean isTravelPlanGenerated(String aiResponse) {
        if (aiResponse == null || aiResponse.trim().isEmpty()) {
            return false;
        }
        
        // 检查是否包含旅游计划的关键词
        String response = aiResponse.toLowerCase();
        return response.contains("旅游计划") || 
               response.contains("行程安排") || 
               response.contains("住宿建议") || 
               response.contains("美食推荐") || 
               response.contains("预算估算") ||
               response.contains("景点推荐") ||
               response.contains("交通建议");
    }
    
    /**
     * 从AI回复中创建旅游计划
     */
    private Long createTravelPlanFromAIResponse(Long userId, String userMessage, String aiResponse) {
        try {
            // 从用户消息中提取目的地
            String destination = extractDestination(userMessage);
            
            // 生成计划名称
            String planName = generatePlanName(destination, userMessage);
            
            // 创建旅游计划
            com.travelplanner.entity.TravelPlan plan = travelPlanService.createPlan(
                userId,
                planName,
                destination,
                null, // startDate
                null, // endDate
                null, // budget
                "休闲", // travelType
                1, // groupSize
                userMessage // specialRequirements
            );
            
            // 设置状态为生成中
            plan.setStatus(com.travelplanner.entity.TravelPlan.PlanStatus.GENERATING);
            travelPlanService.updatePlan(plan);
            
            // 设置AI生成的内容（这会自动将状态更新为COMPLETED）
            travelPlanService.setAiGenerated(plan.getId(), aiResponse);
            
            return plan.getId();
            
        } catch (Exception e) {
            log.error("从AI回复创建旅游计划失败: {}", e.getMessage());
            throw new RuntimeException("创建旅游计划失败: " + e.getMessage());
        }
    }
    
    /**
     * 从用户消息中提取目的地
     */
    private String extractDestination(String userMessage) {
        if (userMessage == null) return "未知目的地";
        
        String message = userMessage.toLowerCase();
        
        // 检查常见城市
        if (message.contains("北京") || message.contains("beijing")) {
            return "北京";
        } else if (message.contains("上海") || message.contains("shanghai")) {
            return "上海";
        } else if (message.contains("杭州") || message.contains("hangzhou")) {
            return "杭州";
        } else if (message.contains("广州") || message.contains("guangzhou")) {
            return "广州";
        } else if (message.contains("深圳") || message.contains("shenzhen")) {
            return "深圳";
        } else if (message.contains("成都") || message.contains("chengdu")) {
            return "成都";
        } else if (message.contains("西安") || message.contains("xian")) {
            return "西安";
        } else if (message.contains("南京") || message.contains("nanjing")) {
            return "南京";
        } else if (message.contains("苏州") || message.contains("suzhou")) {
            return "苏州";
        } else if (message.contains("厦门") || message.contains("xiamen")) {
            return "厦门";
        }
        
        // 尝试提取其他城市名称
        String[] cities = {"重庆", "天津", "武汉", "长沙", "郑州", "青岛", "大连", "宁波", "福州", "昆明"};
        for (String city : cities) {
            if (message.contains(city.toLowerCase())) {
                return city;
            }
        }
        
        return "未知目的地";
    }
    
    /**
     * 生成计划名称
     */
    private String generatePlanName(String destination, String userMessage) {
        if (destination != null && !destination.equals("未知目的地")) {
            return destination + "旅游计划";
        }
        
        // 从用户消息中提取关键词
        if (userMessage.contains("3天") || userMessage.contains("三天")) {
            return "3天旅游计划";
        } else if (userMessage.contains("2天") || userMessage.contains("两天")) {
            return "2天旅游计划";
        } else if (userMessage.contains("1天") || userMessage.contains("一天")) {
            return "1天旅游计划";
        }
        
        return "智能旅游计划";
    }
    
    /**
     * 转换为响应DTO
     */
    private ConversationResponse convertToResponse(com.travelplanner.entity.Conversation conversation) {
        ConversationResponse response = new ConversationResponse();
        response.setId(conversation.getId());
        response.setUserId(conversation.getUserId());
        response.setPlanId(conversation.getPlanId());
        response.setUserMessage(conversation.getUserMessage());
        response.setAiResponse(conversation.getAiResponse());
        response.setMessageType(conversation.getMessageType());
        response.setVoiceFileUrl(conversation.getVoiceFileUrl());
        response.setProcessingTime(conversation.getProcessingTime());
        response.setCreatedAt(conversation.getCreatedAt());
        return response;
    }
    
    // 内部类：请求和响应DTO
    public static class ChatRequest {
        private Long userId;
        private Long planId;
        private String message;
        private String apiKey;
        
        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getPlanId() { return planId; }
        public void setPlanId(Long planId) { this.planId = planId; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    }
    
    public static class ChatResponse {
        private String message;
        private Long processingTime;
        private String timestamp;
        private Long createdPlanId;
        
        // Getters and Setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public Long getProcessingTime() { return processingTime; }
        public void setProcessingTime(Long processingTime) { this.processingTime = processingTime; }
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        public Long getCreatedPlanId() { return createdPlanId; }
        public void setCreatedPlanId(Long createdPlanId) { this.createdPlanId = createdPlanId; }
    }
    
    public static class VoiceChatResponse {
        private String userMessage;
        private String aiResponse;
        private String voiceFileUrl;
        private Long processingTime;
        private String timestamp;
        
        // Getters and Setters
        public String getUserMessage() { return userMessage; }
        public void setUserMessage(String userMessage) { this.userMessage = userMessage; }
        public String getAiResponse() { return aiResponse; }
        public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }
        public String getVoiceFileUrl() { return voiceFileUrl; }
        public void setVoiceFileUrl(String voiceFileUrl) { this.voiceFileUrl = voiceFileUrl; }
        public Long getProcessingTime() { return processingTime; }
        public void setProcessingTime(Long processingTime) { this.processingTime = processingTime; }
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }
    
    public static class ConversationResponse {
        private Long id;
        private Long userId;
        private Long planId;
        private String userMessage;
        private String aiResponse;
        private String messageType;
        private String voiceFileUrl;
        private Long processingTime;
        private LocalDateTime createdAt;
        
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getPlanId() { return planId; }
        public void setPlanId(Long planId) { this.planId = planId; }
        public String getUserMessage() { return userMessage; }
        public void setUserMessage(String userMessage) { this.userMessage = userMessage; }
        public String getAiResponse() { return aiResponse; }
        public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }
        public String getMessageType() { return messageType; }
        public void setMessageType(String messageType) { this.messageType = messageType; }
        public String getVoiceFileUrl() { return voiceFileUrl; }
        public void setVoiceFileUrl(String voiceFileUrl) { this.voiceFileUrl = voiceFileUrl; }
        public Long getProcessingTime() { return processingTime; }
        public void setProcessingTime(Long processingTime) { this.processingTime = processingTime; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
    
    /**
     * 手动保存AI回答为旅游计划
     * 
     * @param request 保存请求
     * @return 创建的计划ID
     */
    @PostMapping("/save-as-plan")
    public ResponseEntity<?> saveAsPlan(@Valid @RequestBody SaveAsPlanRequest request) {
        try {
            log.info("用户手动保存AI回答为旅游计划: userId={}, conversationId={}", 
                request.getUserId(), request.getConversationId());
            
            // 获取对话记录
            Optional<Conversation> conversationOpt = conversationService.findById(request.getConversationId());
            if (!conversationOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(MapUtils.of("error", "对话记录不存在"));
            }
            
            Conversation conversation = conversationOpt.get();
            
            // 创建旅游计划
            Long planId = createTravelPlanFromAIResponse(
                request.getUserId(), 
                conversation.getUserMessage(), 
                conversation.getAiResponse()
            );
            
            // 更新对话记录，关联到新创建的计划
            conversationService.updatePlanId(conversation.getId(), planId);
            
            return ResponseEntity.ok(MapUtils.of("planId", planId, "message", "旅游计划创建成功"));
            
        } catch (Exception e) {
            log.error("保存AI回答为旅游计划失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", "保存失败: " + e.getMessage()));
        }
    }
    
    /**
     * 直接保存AI回复为旅游计划（前端直接发送数据）
     * 
     * @param request 直接保存请求
     * @return 创建的计划ID
     */
    @PostMapping("/save-as-plan-direct")
    public ResponseEntity<?> saveAsPlanDirect(@Valid @RequestBody DirectSaveAsPlanRequest request) {
        try {
            log.info("用户直接保存AI回答为旅游计划: userId={}, userMessage={}", 
                request.getUserId(), request.getUserMessage());
            
            // 创建旅游计划
            Long planId = createTravelPlanFromAIResponse(
                request.getUserId(), 
                request.getUserMessage(), 
                request.getAiResponse()
            );
            
            return ResponseEntity.ok(MapUtils.of("planId", planId, "message", "旅游计划创建成功"));
            
        } catch (Exception e) {
            log.error("直接保存AI回答为旅游计划失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", "保存失败: " + e.getMessage()));
        }
    }
    
    /**
     * 保存AI回答为旅游计划请求
     */
    public static class SaveAsPlanRequest {
        private Long userId;
        private Long conversationId;
        
        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getConversationId() { return conversationId; }
        public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
    }
    
    /**
     * 直接保存AI回答为旅游计划请求
     */
    public static class DirectSaveAsPlanRequest {
        private Long userId;
        private String userMessage;
        private String aiResponse;
        
        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserMessage() { return userMessage; }
        public void setUserMessage(String userMessage) { this.userMessage = userMessage; }
        public String getAiResponse() { return aiResponse; }
        public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }
    }
}

