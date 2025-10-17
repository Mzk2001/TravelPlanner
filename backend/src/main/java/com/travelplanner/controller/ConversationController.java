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
import com.travelplanner.util.MapUtils;

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
            log.info("收到聊天请求: userId={}, planId={}", request.getUserId(), request.getPlanId());
            
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
            String aiResponse = aiService.generateTravelPlan(request.getMessage(), planContext);
            
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
            
            // 构建响应
            ChatResponse response = new ChatResponse();
            response.setMessage(aiResponse);
            response.setProcessingTime(processingTime);
            response.setTimestamp(LocalDateTime.now());
            
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
            response.setTimestamp(LocalDateTime.now());
            
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
        
        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getPlanId() { return planId; }
        public void setPlanId(Long planId) { this.planId = planId; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
    
    public static class ChatResponse {
        private String message;
        private Long processingTime;
        private LocalDateTime timestamp;
        
        // Getters and Setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public Long getProcessingTime() { return processingTime; }
        public void setProcessingTime(Long processingTime) { this.processingTime = processingTime; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
    
    public static class VoiceChatResponse {
        private String userMessage;
        private String aiResponse;
        private String voiceFileUrl;
        private Long processingTime;
        private LocalDateTime timestamp;
        
        // Getters and Setters
        public String getUserMessage() { return userMessage; }
        public void setUserMessage(String userMessage) { this.userMessage = userMessage; }
        public String getAiResponse() { return aiResponse; }
        public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }
        public String getVoiceFileUrl() { return voiceFileUrl; }
        public void setVoiceFileUrl(String voiceFileUrl) { this.voiceFileUrl = voiceFileUrl; }
        public Long getProcessingTime() { return processingTime; }
        public void setProcessingTime(Long processingTime) { this.processingTime = processingTime; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
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
}

