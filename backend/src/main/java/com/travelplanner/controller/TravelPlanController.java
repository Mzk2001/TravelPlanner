package com.travelplanner.controller;

import com.travelplanner.entity.TravelPlan;
import com.travelplanner.service.TravelPlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import com.travelplanner.util.MapUtils;
import java.util.Optional;

/**
 * 旅游计划控制器
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/plans")
@RequiredArgsConstructor
@Slf4j
public class TravelPlanController {
    
    private final TravelPlanService travelPlanService;
    
    /**
     * 创建旅游计划
     * 
     * @param request 创建请求
     * @return 创建结果
     */
    @PostMapping
    public ResponseEntity<?> createPlan(@Valid @RequestBody CreatePlanRequest request) {
        try {
            log.info("创建旅游计划: userId={}, planName={}", request.getUserId(), request.getPlanName());
            
            TravelPlan plan = travelPlanService.createPlan(
                request.getUserId(),
                request.getPlanName(),
                request.getDestination(),
                request.getStartDate(),
                request.getEndDate(),
                request.getBudget(),
                request.getTravelType(),
                request.getGroupSize(),
                request.getSpecialRequirements()
            );
            
            return ResponseEntity.ok(convertToResponse(plan));
            
        } catch (Exception e) {
            log.error("创建旅游计划失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", e.getMessage()));
        }
    }
    
    /**
     * 获取旅游计划详情
     * 
     * @param planId 计划ID
     * @return 计划详情
     */
    @GetMapping("/{planId}")
    public ResponseEntity<?> getPlan(@PathVariable Long planId) {
        try {
            Optional<TravelPlan> plan = travelPlanService.findById(planId);
            if (plan.isPresent()) {
                return ResponseEntity.ok(convertToResponse(plan.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("获取旅游计划失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", e.getMessage()));
        }
    }
    
    /**
     * 获取用户的旅游计划列表
     * 
     * @param userId 用户ID
     * @param page 页码
     * @param size 每页大小
     * @param status 计划状态
     * @return 计划列表
     */
    @GetMapping
    public ResponseEntity<?> getUserPlans(@RequestParam Long userId,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        @RequestParam(required = false) String status) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<TravelPlan> plans;
            
            if (status != null && !status.isEmpty()) {
                TravelPlan.PlanStatus planStatus = TravelPlan.PlanStatus.valueOf(status.toUpperCase());
                plans = travelPlanService.findByUserIdAndStatus(userId, planStatus, pageable);
            } else {
                plans = travelPlanService.findByUserId(userId, pageable);
            }
            
            Page<PlanResponse> response = plans.map(this::convertToResponse);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("获取旅游计划列表失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", e.getMessage()));
        }
    }
    
    /**
     * 更新旅游计划
     * 
     * @param planId 计划ID
     * @param request 更新请求
     * @return 更新结果
     */
    @PutMapping("/{planId}")
    public ResponseEntity<?> updatePlan(@PathVariable Long planId,
                                      @Valid @RequestBody UpdatePlanRequest request) {
        try {
            log.info("更新旅游计划: planId={}", planId);
            log.info("接收到的请求数据: planName={}, destination={}, budget={}, groupSize={}, travelType={}", 
                    request.getPlanName(), request.getDestination(), request.getBudget(), 
                    request.getGroupSize(), request.getTravelType());
            log.info("日期信息: startDate={}, endDate={}", request.getStartDate(), request.getEndDate());
            log.info("特殊需求长度: {}", request.getSpecialRequirements() != null ? request.getSpecialRequirements().length() : 0);
            
            Optional<TravelPlan> planOpt = travelPlanService.findById(planId);
            if (!planOpt.isPresent()) {
                log.warn("计划不存在: planId={}", planId);
                return ResponseEntity.notFound().build();
            }
            
            TravelPlan plan = planOpt.get();
            plan.setPlanName(request.getPlanName());
            plan.setDestination(request.getDestination());
            plan.setStartDate(request.getStartDate());
            plan.setEndDate(request.getEndDate());
            plan.setBudget(request.getBudget());
            plan.setTravelType(request.getTravelType());
            plan.setGroupSize(request.getGroupSize());
            plan.setSpecialRequirements(request.getSpecialRequirements());
            if (request.getAiGenerated() != null) {
                plan.setAiGenerated(request.getAiGenerated());
            }
            
            TravelPlan updatedPlan = travelPlanService.updatePlan(plan);
            log.info("计划更新成功: planId={}", planId);
            return ResponseEntity.ok(convertToResponse(updatedPlan));
            
        } catch (Exception e) {
            log.error("更新旅游计划失败: planId={}, error={}", planId, e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", e.getMessage()));
        }
    }
    
    
    /**
     * 删除旅游计划
     * 
     * @param planId 计划ID
     * @return 删除结果
     */
    @DeleteMapping("/{planId}")
    public ResponseEntity<?> deletePlan(@PathVariable Long planId) {
        try {
            log.info("删除旅游计划: planId={}", planId);
            
            travelPlanService.deletePlan(planId);
            return ResponseEntity.ok(MapUtils.of("message", "删除成功"));
            
        } catch (Exception e) {
            log.error("删除旅游计划失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", e.getMessage()));
        }
    }
    
    /**
     * 转换为响应DTO
     */
    private PlanResponse convertToResponse(TravelPlan plan) {
        PlanResponse response = new PlanResponse();
        response.setId(plan.getId());
        response.setUserId(plan.getUserId());
        response.setPlanName(plan.getPlanName());
        response.setDestination(plan.getDestination());
        response.setStartDate(plan.getStartDate());
        response.setEndDate(plan.getEndDate());
        response.setBudget(plan.getBudget());
        response.setTravelType(plan.getTravelType());
        response.setGroupSize(plan.getGroupSize());
        response.setSpecialRequirements(plan.getSpecialRequirements());
        response.setStatus(plan.getStatus());
        response.setAiGenerated(plan.getAiGenerated());
        response.setCreatedAt(plan.getCreatedAt());
        response.setUpdatedAt(plan.getUpdatedAt());
        return response;
    }
    
    // 内部类：请求和响应DTO
    public static class CreatePlanRequest {
        private Long userId;
        private String planName;
        private String destination;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Double budget;
        private String travelType;
        private Integer groupSize;
        private String specialRequirements;
        
        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getPlanName() { return planName; }
        public void setPlanName(String planName) { this.planName = planName; }
        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }
        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
        public Double getBudget() { return budget; }
        public void setBudget(Double budget) { this.budget = budget; }
        public String getTravelType() { return travelType; }
        public void setTravelType(String travelType) { this.travelType = travelType; }
        public Integer getGroupSize() { return groupSize; }
        public void setGroupSize(Integer groupSize) { this.groupSize = groupSize; }
        public String getSpecialRequirements() { return specialRequirements; }
        public void setSpecialRequirements(String specialRequirements) { this.specialRequirements = specialRequirements; }
    }
    
    public static class UpdatePlanRequest {
        private String planName;
        private String destination;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Double budget;
        private String travelType;
        private Integer groupSize;
        private String specialRequirements;
        private String aiGenerated;
        
        // Getters and Setters
        public String getPlanName() { return planName; }
        public void setPlanName(String planName) { this.planName = planName; }
        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }
        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
        public Double getBudget() { return budget; }
        public void setBudget(Double budget) { this.budget = budget; }
        public String getTravelType() { return travelType; }
        public void setTravelType(String travelType) { this.travelType = travelType; }
        public Integer getGroupSize() { return groupSize; }
        public void setGroupSize(Integer groupSize) { this.groupSize = groupSize; }
        public String getSpecialRequirements() { return specialRequirements; }
        public void setSpecialRequirements(String specialRequirements) { this.specialRequirements = specialRequirements; }
        public String getAiGenerated() { return aiGenerated; }
        public void setAiGenerated(String aiGenerated) { this.aiGenerated = aiGenerated; }
    }
    
    
    public static class PlanResponse {
        private Long id;
        private Long userId;
        private String planName;
        private String destination;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Double budget;
        private String travelType;
        private Integer groupSize;
        private String specialRequirements;
        private TravelPlan.PlanStatus status;
        private String aiGenerated;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getPlanName() { return planName; }
        public void setPlanName(String planName) { this.planName = planName; }
        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }
        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
        public Double getBudget() { return budget; }
        public void setBudget(Double budget) { this.budget = budget; }
        public String getTravelType() { return travelType; }
        public void setTravelType(String travelType) { this.travelType = travelType; }
        public Integer getGroupSize() { return groupSize; }
        public void setGroupSize(Integer groupSize) { this.groupSize = groupSize; }
        public String getSpecialRequirements() { return specialRequirements; }
        public void setSpecialRequirements(String specialRequirements) { this.specialRequirements = specialRequirements; }
        public TravelPlan.PlanStatus getStatus() { return status; }
        public void setStatus(TravelPlan.PlanStatus status) { this.status = status; }
        public String getAiGenerated() { return aiGenerated; }
        public void setAiGenerated(String aiGenerated) { this.aiGenerated = aiGenerated; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }
}
