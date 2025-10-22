package com.travelplanner.entity;

import javax.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 费用记录实体类
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@Entity
@Table(name = "expenses")
@Data
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class Expense {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "plan_id", nullable = false)
    private Long planId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private ExpenseCategory category;
    
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "currency", length = 3, nullable = false)
    private String currency = "CNY";
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "location", length = 200)
    private String location;
    
    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // 现金、信用卡、支付宝、微信等
    
    @Column(name = "receipt_url", length = 500)
    private String receiptUrl; // 收据图片URL
    
    @Column(name = "tags", length = 200)
    private String tags; // 标签，用逗号分隔
    
    @Column(name = "is_reimbursable")
    private Boolean isReimbursable = false; // 是否可报销
    
    @Column(name = "notes", length = 1000)
    private String notes; // 备注
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * 费用类别枚举
     */
    public enum ExpenseCategory {
        TRANSPORTATION("交通"),
        ACCOMMODATION("住宿"),
        MEAL("餐饮"),
        ACTIVITY("活动"),
        SHOPPING("购物"),
        HEALTH("医疗"),
        ENTERTAINMENT("娱乐"),
        OTHER("其他");
        
        private final String displayName;
        
        ExpenseCategory(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}


