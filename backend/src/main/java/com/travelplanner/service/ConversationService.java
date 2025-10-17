package com.travelplanner.service;

import com.travelplanner.entity.Conversation;
import com.travelplanner.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 对话服务类
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ConversationService {
    
    private final ConversationRepository conversationRepository;
    
    /**
     * 保存对话记录
     * 
     * @param userId 用户ID
     * @param planId 计划ID
     * @param userMessage 用户消息
     * @param aiResponse AI回复
     * @param messageType 消息类型
     * @param voiceFileUrl 语音文件URL
     * @param processingTime 处理时间
     * @return 保存的对话记录
     */
    public Conversation saveConversation(Long userId, Long planId, String userMessage,
                                       String aiResponse, String messageType,
                                       String voiceFileUrl, Long processingTime) {
        log.info("保存对话记录: userId={}, planId={}", userId, planId);
        
        Conversation conversation = new Conversation();
        conversation.setUserId(userId);
        conversation.setPlanId(planId);
        conversation.setUserMessage(userMessage);
        conversation.setAiResponse(aiResponse);
        conversation.setMessageType(messageType);
        conversation.setVoiceFileUrl(voiceFileUrl);
        conversation.setProcessingTime(processingTime);
        
        Conversation savedConversation = conversationRepository.save(conversation);
        log.info("对话记录保存成功: conversationId={}", savedConversation.getId());
        
        return savedConversation;
    }
    
    /**
     * 根据ID查找对话记录
     * 
     * @param id 对话ID
     * @return 对话记录
     */
    @Transactional(readOnly = true)
    public Optional<Conversation> findById(Long id) {
        return conversationRepository.findById(id);
    }
    
    /**
     * 根据用户ID查找对话记录
     * 
     * @param userId 用户ID
     * @param pageable 分页参数
     * @return 对话记录分页列表
     */
    @Transactional(readOnly = true)
    public Page<Conversation> findByUserId(Long userId, Pageable pageable) {
        return conversationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    /**
     * 根据用户ID和计划ID查找对话记录
     * 
     * @param userId 用户ID
     * @param planId 计划ID
     * @param pageable 分页参数
     * @return 对话记录分页列表
     */
    @Transactional(readOnly = true)
    public Page<Conversation> findByUserIdAndPlanId(Long userId, Long planId, Pageable pageable) {
        return conversationRepository.findByUserIdAndPlanIdOrderByCreatedAtDesc(userId, planId, pageable);
    }
    
    /**
     * 根据计划ID查找对话记录
     * 
     * @param planId 计划ID
     * @return 对话记录列表
     */
    @Transactional(readOnly = true)
    public List<Conversation> findByPlanId(Long planId) {
        return conversationRepository.findByPlanIdOrderByCreatedAtAsc(planId);
    }
    
    /**
     * 查找指定时间范围内的对话记录
     * 
     * @param userId 用户ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param pageable 分页参数
     * @return 对话记录分页列表
     */
    @Transactional(readOnly = true)
    public Page<Conversation> findByUserIdAndTimeRange(Long userId, LocalDateTime startTime,
                                                      LocalDateTime endTime, Pageable pageable) {
        return conversationRepository.findByUserIdAndTimeRange(userId, startTime, endTime, pageable);
    }
    
    /**
     * 统计用户的对话记录数量
     * 
     * @param userId 用户ID
     * @return 对话记录数量
     */
    @Transactional(readOnly = true)
    public long countByUserId(Long userId) {
        return conversationRepository.countByUserId(userId);
    }
    
    /**
     * 统计计划的对话记录数量
     * 
     * @param planId 计划ID
     * @return 对话记录数量
     */
    @Transactional(readOnly = true)
    public long countByPlanId(Long planId) {
        return conversationRepository.countByPlanId(planId);
    }
    
    /**
     * 删除对话记录
     * 
     * @param conversationId 对话ID
     */
    public void deleteConversation(Long conversationId) {
        log.info("删除对话记录: conversationId={}", conversationId);
        conversationRepository.deleteById(conversationId);
    }
}
