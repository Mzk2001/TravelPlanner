package com.travelplanner.repository;

import com.travelplanner.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 对话记录数据访问接口
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    /**
     * 根据用户ID查找对话记录
     * 
     * @param userId 用户ID
     * @param pageable 分页参数
     * @return 对话记录分页列表
     */
    Page<Conversation> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * 根据用户ID和计划ID查找对话记录
     * 
     * @param userId 用户ID
     * @param planId 计划ID
     * @param pageable 分页参数
     * @return 对话记录分页列表
     */
    Page<Conversation> findByUserIdAndPlanIdOrderByCreatedAtDesc(Long userId, Long planId, Pageable pageable);
    
    /**
     * 根据计划ID查找对话记录
     * 
     * @param planId 计划ID
     * @return 对话记录列表
     */
    List<Conversation> findByPlanIdOrderByCreatedAtAsc(Long planId);
    
    /**
     * 查找指定时间范围内的对话记录
     * 
     * @param userId 用户ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param pageable 分页参数
     * @return 对话记录分页列表
     */
    @Query("SELECT c FROM Conversation c WHERE c.userId = :userId AND c.createdAt >= :startTime AND c.createdAt <= :endTime ORDER BY c.createdAt DESC")
    Page<Conversation> findByUserIdAndTimeRange(@Param("userId") Long userId,
                                              @Param("startTime") LocalDateTime startTime,
                                              @Param("endTime") LocalDateTime endTime,
                                              Pageable pageable);
    
    /**
     * 统计用户的对话记录数量
     * 
     * @param userId 用户ID
     * @return 对话记录数量
     */
    long countByUserId(Long userId);
    
    /**
     * 统计计划的对话记录数量
     * 
     * @param planId 计划ID
     * @return 对话记录数量
     */
    long countByPlanId(Long planId);
    
    /**
     * 根据用户ID删除所有对话记录
     * 
     * @param userId 用户ID
     */
    void deleteByUserId(Long userId);
    
    /**
     * 根据用户ID和计划ID删除对话记录
     * 
     * @param userId 用户ID
     * @param planId 计划ID
     */
    void deleteByUserIdAndPlanId(Long userId, Long planId);
}
