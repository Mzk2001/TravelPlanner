package com.travelplanner.entity;

import javax.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 对话记录实体类
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@Entity
@Table(name = "conversations")
@Data
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class Conversation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "plan_id")
    private Long planId;
    
    @Column(name = "user_message", length = 2000)
    private String userMessage;
    
    @Column(name = "ai_response", length = 5000)
    private String aiResponse;
    
    @Column(name = "message_type", length = 50)
    private String messageType; // text, voice, image
    
    @Column(name = "voice_file_url", length = 500)
    private String voiceFileUrl;
    
    @Column(name = "processing_time")
    private Long processingTime; // 处理时间(毫秒)
    
    @Column(name = "extracted_fields", length = 1000)
    private String extractedFields; // 提取的旅行字段(JSON格式)
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
