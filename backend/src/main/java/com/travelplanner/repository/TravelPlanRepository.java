package com.travelplanner.repository;

import com.travelplanner.entity.TravelPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 旅游计划数据访问接口
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@Repository
public interface TravelPlanRepository extends JpaRepository<TravelPlan, Long> {
    
    /**
     * 根据用户ID查找旅游计划
     * 
     * @param userId 用户ID
     * @param pageable 分页参数
     * @return 旅游计划分页列表
     */
    Page<TravelPlan> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * 根据用户ID和状态查找旅游计划
     * 
     * @param userId 用户ID
     * @param status 计划状态
     * @param pageable 分页参数
     * @return 旅游计划分页列表
     */
    Page<TravelPlan> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, TravelPlan.PlanStatus status, Pageable pageable);
    
    /**
     * 根据目的地查找旅游计划
     * 
     * @param destination 目的地
     * @param pageable 分页参数
     * @return 旅游计划分页列表
     */
    Page<TravelPlan> findByDestinationContainingIgnoreCaseOrderByCreatedAtDesc(String destination, Pageable pageable);
    
    /**
     * 查找指定日期范围内的旅游计划
     * 
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param pageable 分页参数
     * @return 旅游计划分页列表
     */
    @Query("SELECT tp FROM TravelPlan tp WHERE tp.startDate >= :startDate AND tp.endDate <= :endDate ORDER BY tp.createdAt DESC")
    Page<TravelPlan> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                   @Param("endDate") LocalDateTime endDate, 
                                   Pageable pageable);
    
    /**
     * 统计用户的旅游计划数量
     * 
     * @param userId 用户ID
     * @return 计划数量
     */
    long countByUserId(Long userId);
    
    /**
     * 统计用户指定状态的旅游计划数量
     * 
     * @param userId 用户ID
     * @param status 计划状态
     * @return 计划数量
     */
    long countByUserIdAndStatus(Long userId, TravelPlan.PlanStatus status);
}
