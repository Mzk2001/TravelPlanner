package com.travelplanner.service;

import com.travelplanner.entity.Expense;
import com.travelplanner.entity.TravelPlan;
import com.travelplanner.repository.ExpenseRepository;
import com.travelplanner.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

/**
 * 费用管理服务类
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ExpenseService {
    
    private final ExpenseRepository expenseRepository;
    private final TravelPlanRepository travelPlanRepository;
    private final AiService aiService;
    
    /**
     * 创建费用记录
     * 
     * @param expense 费用记录
     * @return 创建的费用记录
     */
    public Expense createExpense(Expense expense) {
        log.info("创建费用记录: planId={}, amount={}, category={}", 
                expense.getPlanId(), expense.getAmount(), expense.getCategory());
        
        // 验证计划是否存在
        if (!travelPlanRepository.existsById(expense.getPlanId())) {
            throw new IllegalArgumentException("旅游计划不存在");
        }
        
        Expense savedExpense = expenseRepository.save(expense);
        log.info("费用记录创建成功: expenseId={}", savedExpense.getId());
        
        return savedExpense;
    }
    
    /**
     * 更新费用记录
     * 
     * @param expenseId 费用记录ID
     * @param expense 更新的费用记录
     * @return 更新后的费用记录
     */
    public Expense updateExpense(Long expenseId, Expense expense) {
        log.info("更新费用记录: expenseId={}", expenseId);
        
        Expense existingExpense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("费用记录不存在"));
        
        // 更新字段
        existingExpense.setCategory(expense.getCategory());
        existingExpense.setAmount(expense.getAmount());
        existingExpense.setCurrency(expense.getCurrency());
        existingExpense.setDescription(expense.getDescription());
        existingExpense.setLocation(expense.getLocation());
        existingExpense.setExpenseDate(expense.getExpenseDate());
        existingExpense.setPaymentMethod(expense.getPaymentMethod());
        existingExpense.setReceiptUrl(expense.getReceiptUrl());
        existingExpense.setTags(expense.getTags());
        existingExpense.setIsReimbursable(expense.getIsReimbursable());
        existingExpense.setNotes(expense.getNotes());
        
        Expense updatedExpense = expenseRepository.save(existingExpense);
        log.info("费用记录更新成功: expenseId={}", updatedExpense.getId());
        
        return updatedExpense;
    }
    
    /**
     * 删除费用记录
     * 
     * @param expenseId 费用记录ID
     */
    public void deleteExpense(Long expenseId) {
        log.info("删除费用记录: expenseId={}", expenseId);
        
        if (!expenseRepository.existsById(expenseId)) {
            throw new IllegalArgumentException("费用记录不存在");
        }
        
        expenseRepository.deleteById(expenseId);
        log.info("费用记录删除成功: expenseId={}", expenseId);
    }
    
    /**
     * 根据ID查找费用记录
     * 
     * @param expenseId 费用记录ID
     * @return 费用记录
     */
    @Transactional(readOnly = true)
    public Optional<Expense> findById(Long expenseId) {
        return expenseRepository.findById(expenseId);
    }
    
    /**
     * 根据计划ID查找费用记录
     * 
     * @param planId 计划ID
     * @param pageable 分页参数
     * @return 费用记录分页列表
     */
    @Transactional(readOnly = true)
    public Page<Expense> findByPlanId(Long planId, Pageable pageable) {
        return expenseRepository.findByPlanIdOrderByExpenseDateDesc(planId, pageable);
    }
    
    /**
     * 根据用户ID查找费用记录
     * 
     * @param userId 用户ID
     * @param pageable 分页参数
     * @return 费用记录分页列表
     */
    @Transactional(readOnly = true)
    public Page<Expense> findByUserId(Long userId, Pageable pageable) {
        return expenseRepository.findByUserIdOrderByExpenseDateDesc(userId, pageable);
    }
    
    /**
     * 根据计划ID和用户ID查找费用记录
     * 
     * @param planId 计划ID
     * @param userId 用户ID
     * @param pageable 分页参数
     * @return 费用记录分页列表
     */
    @Transactional(readOnly = true)
    public Page<Expense> findByPlanIdAndUserId(Long planId, Long userId, Pageable pageable) {
        return expenseRepository.findByPlanIdAndUserIdOrderByExpenseDateDesc(planId, userId, pageable);
    }
    
    /**
     * 根据计划ID和费用类别查找费用记录
     * 
     * @param planId 计划ID
     * @param category 费用类别
     * @param pageable 分页参数
     * @return 费用记录分页列表
     */
    @Transactional(readOnly = true)
    public Page<Expense> findByPlanIdAndCategory(Long planId, Expense.ExpenseCategory category, Pageable pageable) {
        return expenseRepository.findByPlanIdAndCategoryOrderByExpenseDateDesc(planId, category, pageable);
    }
    
    /**
     * 根据计划ID和日期范围查找费用记录
     * 
     * @param planId 计划ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param pageable 分页参数
     * @return 费用记录分页列表
     */
    @Transactional(readOnly = true)
    public Page<Expense> findByPlanIdAndDateRange(Long planId, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return expenseRepository.findByPlanIdAndExpenseDateBetweenOrderByExpenseDateDesc(planId, startDate, endDate, pageable);
    }
    
    /**
     * 获取计划的总费用
     * 
     * @param planId 计划ID
     * @return 总费用
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalAmountByPlanId(Long planId) {
        return expenseRepository.getTotalAmountByPlanId(planId);
    }
    
    /**
     * 获取计划的费用按类别统计
     * 
     * @param planId 计划ID
     * @return 费用统计Map
     */
    @Transactional(readOnly = true)
    public Map<Expense.ExpenseCategory, BigDecimal> getAmountByCategoryAndPlanId(Long planId) {
        List<Object[]> results = expenseRepository.getAmountByCategoryAndPlanId(planId);
        Map<Expense.ExpenseCategory, BigDecimal> categoryAmounts = new HashMap<>();
        
        for (Object[] result : results) {
            Expense.ExpenseCategory category = (Expense.ExpenseCategory) result[0];
            BigDecimal amount = (BigDecimal) result[1];
            categoryAmounts.put(category, amount);
        }
        
        return categoryAmounts;
    }
    
    /**
     * 获取用户的费用按类别统计
     * 
     * @param userId 用户ID
     * @return 费用统计Map
     */
    @Transactional(readOnly = true)
    public Map<Expense.ExpenseCategory, BigDecimal> getAmountByCategoryAndUserId(Long userId) {
        List<Object[]> results = expenseRepository.getAmountByCategoryAndUserId(userId);
        Map<Expense.ExpenseCategory, BigDecimal> categoryAmounts = new HashMap<>();
        
        for (Object[] result : results) {
            Expense.ExpenseCategory category = (Expense.ExpenseCategory) result[0];
            BigDecimal amount = (BigDecimal) result[1];
            categoryAmounts.put(category, amount);
        }
        
        return categoryAmounts;
    }
    
    /**
     * 获取计划的费用按日期统计
     * 
     * @param planId 计划ID
     * @return 费用统计Map
     */
    @Transactional(readOnly = true)
    public Map<LocalDate, BigDecimal> getAmountByDateAndPlanId(Long planId) {
        List<Object[]> results = expenseRepository.getAmountByDateAndPlanId(planId);
        Map<LocalDate, BigDecimal> dateAmounts = new HashMap<>();
        
        for (Object[] result : results) {
            LocalDate date = (LocalDate) result[0];
            BigDecimal amount = (BigDecimal) result[1];
            dateAmounts.put(date, amount);
        }
        
        return dateAmounts;
    }
    
    /**
     * 获取计划的预算分析
     * 
     * @param planId 计划ID
     * @return 预算分析结果
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getBudgetAnalysis(Long planId) {
        Optional<TravelPlan> planOpt = travelPlanRepository.findById(planId);
        if (!planOpt.isPresent()) {
            throw new IllegalArgumentException("旅游计划不存在");
        }
        
        TravelPlan plan = planOpt.get();
        log.info("获取预算分析 - 计划ID: {}, 计划预算: {}", planId, plan.getBudget());
        BigDecimal totalBudget = plan.getBudget() != null ? BigDecimal.valueOf(plan.getBudget().doubleValue()) : BigDecimal.ZERO;
        BigDecimal totalExpense = getTotalAmountByPlanId(planId);
        log.info("预算分析 - 总预算: {}, 总支出: {}", totalBudget, totalExpense);
        Map<Expense.ExpenseCategory, BigDecimal> categoryAmounts = getAmountByCategoryAndPlanId(planId);
        
        // 将枚举键转换为字符串键，确保JSON序列化正确
        Map<String, Object> categoryBreakdown = new HashMap<>();
        for (Map.Entry<Expense.ExpenseCategory, BigDecimal> entry : categoryAmounts.entrySet()) {
            categoryBreakdown.put(entry.getKey().getDisplayName(), entry.getValue());
        }
        
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("planId", planId);
        analysis.put("totalBudget", totalBudget);
        analysis.put("totalExpense", totalExpense);
        analysis.put("remainingBudget", totalBudget.subtract(totalExpense));
        analysis.put("budgetUtilization", totalBudget.compareTo(BigDecimal.ZERO) > 0 ? 
                totalExpense.divide(totalBudget, 4, BigDecimal.ROUND_HALF_UP).multiply(new BigDecimal("100")) : BigDecimal.ZERO);
        analysis.put("categoryBreakdown", categoryBreakdown);
        
        // 基础预算建议（规则化）
        List<String> basicSuggestions = new ArrayList<>();
        if (totalExpense.compareTo(totalBudget) > 0) {
            basicSuggestions.add("当前支出已超过预算，建议控制后续支出");
        } else if (totalExpense.divide(totalBudget, 4, BigDecimal.ROUND_HALF_UP).multiply(new BigDecimal("100")).compareTo(new BigDecimal("80")) > 0) {
            basicSuggestions.add("当前支出已超过预算的80%，建议谨慎控制支出");
        }
        
        // 按类别分析
        for (Map.Entry<Expense.ExpenseCategory, BigDecimal> entry : categoryAmounts.entrySet()) {
            BigDecimal categoryAmount = entry.getValue();
            BigDecimal categoryPercentage = totalExpense.compareTo(BigDecimal.ZERO) > 0 ? 
                    categoryAmount.divide(totalExpense, 4, BigDecimal.ROUND_HALF_UP).multiply(new BigDecimal("100")) : BigDecimal.ZERO;
            
            if (categoryPercentage.compareTo(new BigDecimal("50")) > 0) {
                basicSuggestions.add(entry.getKey().getDisplayName() + "支出占比过高，建议适当控制");
            }
        }
        
        analysis.put("basicSuggestions", basicSuggestions);
        
        // AI智能分析
        try {
            Map<String, Object> budgetData = new HashMap<>();
            budgetData.put("totalBudget", totalBudget);
            budgetData.put("remainingBudget", totalBudget.subtract(totalExpense));
            
            Map<String, Object> expenseData = new HashMap<>();
            expenseData.put("totalExpense", totalExpense);
            expenseData.put("budgetUtilization", totalBudget.compareTo(BigDecimal.ZERO) > 0 ? 
                    totalExpense.divide(totalBudget, 4, BigDecimal.ROUND_HALF_UP).multiply(new BigDecimal("100")) : BigDecimal.ZERO);
            expenseData.put("categoryBreakdown", categoryBreakdown);
            
            String aiAnalysis = aiService.analyzeBudgetWithAI(planId, budgetData, expenseData);
            analysis.put("aiAnalysis", aiAnalysis);
            analysis.put("hasAiAnalysis", true);
            
        } catch (Exception e) {
            log.warn("AI预算分析失败，使用基础分析: {}", e.getMessage());
            analysis.put("aiAnalysis", "AI分析暂时不可用，请稍后再试");
            analysis.put("hasAiAnalysis", false);
        }
        
        return analysis;
    }
    
    /**
     * 获取AI预算优化建议
     * 
     * @param planId 计划ID
     * @param targetSavings 目标节省金额
     * @return AI优化建议
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getBudgetOptimization(Long planId, BigDecimal targetSavings) {
        Optional<TravelPlan> planOpt = travelPlanRepository.findById(planId);
        if (!planOpt.isPresent()) {
            throw new IllegalArgumentException("旅游计划不存在");
        }
        
        TravelPlan plan = planOpt.get();
        BigDecimal currentBudget = plan.getBudget() != null ? BigDecimal.valueOf(plan.getBudget().doubleValue()) : BigDecimal.ZERO;
        
        Map<String, Object> result = new HashMap<>();
        result.put("planId", planId);
        result.put("currentBudget", currentBudget);
        result.put("targetSavings", targetSavings);
        result.put("optimizedBudget", currentBudget.subtract(targetSavings));
        
        try {
            String aiOptimization = aiService.optimizeBudgetWithAI(planId, currentBudget, targetSavings);
            result.put("aiOptimization", aiOptimization);
            result.put("hasAiOptimization", true);
            
        } catch (Exception e) {
            log.warn("AI预算优化失败: {}", e.getMessage());
            result.put("aiOptimization", "AI优化建议暂时不可用，请稍后再试");
            result.put("hasAiOptimization", false);
        }
        
        return result;
    }
}
