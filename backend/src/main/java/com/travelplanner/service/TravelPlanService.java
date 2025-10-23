package com.travelplanner.service;

import com.travelplanner.entity.TravelPlan;
import com.travelplanner.repository.TravelPlanRepository;
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
 * 旅游计划服务类
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TravelPlanService {
    
    private final TravelPlanRepository travelPlanRepository;
    
    /**
     * 创建旅游计划
     * 
     * @param userId 用户ID
     * @param planName 计划名称
     * @param destination 目的地
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param budget 预算
     * @param travelType 旅游类型
     * @param groupSize 团队人数
     * @param specialRequirements 特殊要求
     * @return 创建的旅游计划
     */
    public TravelPlan createPlan(Long userId, String planName, String destination,
                                LocalDateTime startDate, LocalDateTime endDate,
                                Double budget, String travelType, Integer groupSize,
                                String specialRequirements) {
        log.info("创建旅游计划: userId={}, planName={}, destination={}", userId, planName, destination);
        
        TravelPlan plan = new TravelPlan();
        plan.setUserId(userId);
        plan.setPlanName(planName);
        plan.setDestination(destination);
        plan.setStartDate(startDate);
        plan.setEndDate(endDate);
        plan.setBudget(budget);
        plan.setTravelType(travelType);
        plan.setGroupSize(groupSize);
        plan.setSpecialRequirements(specialRequirements);
        plan.setStatus(TravelPlan.PlanStatus.DRAFT);
        
        TravelPlan savedPlan = travelPlanRepository.save(plan);
        log.info("旅游计划创建成功: planId={}", savedPlan.getId());
        
        return savedPlan;
    }
    
    /**
     * 根据ID查找旅游计划
     * 
     * @param id 计划ID
     * @return 旅游计划
     */
    @Transactional(readOnly = true)
    public Optional<TravelPlan> findById(Long id) {
        return travelPlanRepository.findById(id);
    }
    
    /**
     * 根据用户ID查找旅游计划
     * 
     * @param userId 用户ID
     * @param pageable 分页参数
     * @return 旅游计划分页列表
     */
    @Transactional(readOnly = true)
    public Page<TravelPlan> findByUserId(Long userId, Pageable pageable) {
        return travelPlanRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    /**
     * 根据用户ID和状态查找旅游计划
     * 
     * @param userId 用户ID
     * @param status 计划状态
     * @param pageable 分页参数
     * @return 旅游计划分页列表
     */
    @Transactional(readOnly = true)
    public Page<TravelPlan> findByUserIdAndStatus(Long userId, TravelPlan.PlanStatus status, Pageable pageable) {
        return travelPlanRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status, pageable);
    }
    
    /**
     * 更新旅游计划
     * 
     * @param plan 旅游计划
     * @return 更新后的旅游计划
     */
    public TravelPlan updatePlan(TravelPlan plan) {
        log.info("更新旅游计划: planId={}", plan.getId());
        return travelPlanRepository.save(plan);
    }
    
    
    /**
     * 设置AI生成内容
     * 
     * @param planId 计划ID
     * @param aiGenerated AI生成内容
     */
    public void setAiGenerated(Long planId, String aiGenerated) {
        log.info("设置AI生成内容: planId={}", planId);
        
        TravelPlan plan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("旅游计划不存在"));
        
        plan.setAiGenerated(aiGenerated);
        plan.setStatus(TravelPlan.PlanStatus.COMPLETED);
        travelPlanRepository.save(plan);
    }
    
    /**
     * 删除旅游计划
     * 
     * @param planId 计划ID
     */
    public void deletePlan(Long planId) {
        log.info("删除旅游计划: planId={}", planId);
        travelPlanRepository.deleteById(planId);
    }
    
    /**
     * 统计用户的旅游计划数量
     * 
     * @param userId 用户ID
     * @return 计划数量
     */
    @Transactional(readOnly = true)
    public long countByUserId(Long userId) {
        return travelPlanRepository.countByUserId(userId);
    }
}
