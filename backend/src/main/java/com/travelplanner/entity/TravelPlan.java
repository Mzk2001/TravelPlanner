package com.travelplanner.entity;

import javax.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 旅游计划实体类
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@Entity
@Table(name = "travel_plans")
@Data
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class TravelPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "plan_name", nullable = false, length = 100)
    private String planName;
    
    @Column(name = "destination", length = 100)
    private String destination;
    
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "budget")
    private Double budget;
    
    @Column(name = "travel_type", length = 50)
    private String travelType; // 休闲、商务、探险等
    
    @Column(name = "group_size")
    private Integer groupSize;
    
    @Column(name = "special_requirements", length = 1000)
    private String specialRequirements;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PlanStatus status = PlanStatus.DRAFT;
    
    @Column(name = "ai_generated", length = 5000)
    private String aiGenerated; // AI生成的计划内容
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * 计划状态枚举
     */
    public enum PlanStatus {
        DRAFT, GENERATING, COMPLETED, CANCELLED
    }
}
