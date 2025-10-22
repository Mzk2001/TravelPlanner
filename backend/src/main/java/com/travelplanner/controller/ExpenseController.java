package com.travelplanner.controller;

import com.travelplanner.entity.Expense;
import com.travelplanner.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import com.travelplanner.util.MapUtils;

/**
 * 费用管理控制器
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
@Slf4j
public class ExpenseController {
    
    private final ExpenseService expenseService;
    
    /**
     * 创建费用记录
     * 
     * @param expense 费用记录
     * @return 创建结果
     */
    @PostMapping
    public ResponseEntity<?> createExpense(@Valid @RequestBody Expense expense) {
        try {
            log.info("创建费用记录请求: planId={}, amount={}", expense.getPlanId(), expense.getAmount());
            
            Expense createdExpense = expenseService.createExpense(expense);
            
            return ResponseEntity.ok(MapUtils.of(
                "code", 200,
                "message", "费用记录创建成功",
                "data", createdExpense
            ));
            
        } catch (Exception e) {
            log.error("创建费用记录失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("code", 400, "message", e.getMessage()));
        }
    }
    
    /**
     * 更新费用记录
     * 
     * @param expenseId 费用记录ID
     * @param expense 更新的费用记录
     * @return 更新结果
     */
    @PutMapping("/{expenseId}")
    public ResponseEntity<?> updateExpense(@PathVariable Long expenseId, @Valid @RequestBody Expense expense) {
        try {
            log.info("更新费用记录请求: expenseId={}", expenseId);
            
            Expense updatedExpense = expenseService.updateExpense(expenseId, expense);
            
            return ResponseEntity.ok(MapUtils.of(
                "code", 200,
                "message", "费用记录更新成功",
                "data", updatedExpense
            ));
            
        } catch (Exception e) {
            log.error("更新费用记录失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("code", 400, "message", e.getMessage()));
        }
    }
    
    /**
     * 删除费用记录
     * 
     * @param expenseId 费用记录ID
     * @return 删除结果
     */
    @DeleteMapping("/{expenseId}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long expenseId) {
        try {
            log.info("删除费用记录请求: expenseId={}", expenseId);
            
            expenseService.deleteExpense(expenseId);
            
            return ResponseEntity.ok(MapUtils.of(
                "code", 200,
                "message", "费用记录删除成功"
            ));
            
        } catch (Exception e) {
            log.error("删除费用记录失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("code", 400, "message", e.getMessage()));
        }
    }
    
    /**
     * 获取费用记录详情
     * 
     * @param expenseId 费用记录ID
     * @return 费用记录详情
     */
    @GetMapping("/{expenseId}")
    public ResponseEntity<?> getExpense(@PathVariable Long expenseId) {
        try {
            Optional<Expense> expense = expenseService.findById(expenseId);
            if (expense.isPresent()) {
                return ResponseEntity.ok(MapUtils.of(
                    "code", 200,
                    "message", "success",
                    "data", expense.get()
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("获取费用记录失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("code", 400, "message", e.getMessage()));
        }
    }
    
    /**
     * 获取计划的费用记录列表
     * 
     * @param planId 计划ID
     * @param page 页码
     * @param size 每页大小
     * @param category 费用类别
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 费用记录列表
     */
    @GetMapping("/plans/{planId}")
    public ResponseEntity<?> getExpensesByPlan(
            @PathVariable Long planId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Expense.ExpenseCategory category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            log.info("获取计划费用记录: planId={}, page={}, size={}", planId, page, size);
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "expenseDate"));
            Page<Expense> expenses;
            
            if (category != null) {
                expenses = expenseService.findByPlanIdAndCategory(planId, category, pageable);
            } else if (startDate != null && endDate != null) {
                expenses = expenseService.findByPlanIdAndDateRange(planId, startDate, endDate, pageable);
            } else {
                expenses = expenseService.findByPlanId(planId, pageable);
            }
            
            return ResponseEntity.ok(MapUtils.of(
                "code", 200,
                "message", "success",
                "data", MapUtils.of(
                    "expenses", expenses.getContent(),
                    "pagination", MapUtils.of(
                        "page", expenses.getNumber(),
                        "size", expenses.getSize(),
                        "total", expenses.getTotalElements(),
                        "totalPages", expenses.getTotalPages()
                    )
                )
            ));
            
        } catch (Exception e) {
            log.error("获取计划费用记录失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("code", 400, "message", e.getMessage()));
        }
    }
    
    /**
     * 获取用户的费用记录列表
     * 
     * @param userId 用户ID
     * @param page 页码
     * @param size 每页大小
     * @return 费用记录列表
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getExpensesByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("获取用户费用记录: userId={}, page={}, size={}", userId, page, size);
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "expenseDate"));
            Page<Expense> expenses = expenseService.findByUserId(userId, pageable);
            
            return ResponseEntity.ok(MapUtils.of(
                "code", 200,
                "message", "success",
                "data", MapUtils.of(
                    "expenses", expenses.getContent(),
                    "pagination", MapUtils.of(
                        "page", expenses.getNumber(),
                        "size", expenses.getSize(),
                        "total", expenses.getTotalElements(),
                        "totalPages", expenses.getTotalPages()
                    )
                )
            ));
            
        } catch (Exception e) {
            log.error("获取用户费用记录失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("code", 400, "message", e.getMessage()));
        }
    }
    
    /**
     * 获取计划的总费用
     * 
     * @param planId 计划ID
     * @return 总费用
     */
    @GetMapping("/plans/{planId}/total")
    public ResponseEntity<?> getTotalAmountByPlan(@PathVariable Long planId) {
        try {
            BigDecimal totalAmount = expenseService.getTotalAmountByPlanId(planId);
            
            return ResponseEntity.ok(MapUtils.of(
                "code", 200,
                "message", "success",
                "data", MapUtils.of(
                    "planId", planId,
                    "totalAmount", totalAmount
                )
            ));
            
        } catch (Exception e) {
            log.error("获取计划总费用失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("code", 400, "message", e.getMessage()));
        }
    }
    
    /**
     * 获取计划的费用按类别统计
     * 
     * @param planId 计划ID
     * @return 费用统计
     */
    @GetMapping("/plans/{planId}/category-stats")
    public ResponseEntity<?> getCategoryStatsByPlan(@PathVariable Long planId) {
        try {
            Map<Expense.ExpenseCategory, BigDecimal> categoryStats = expenseService.getAmountByCategoryAndPlanId(planId);
            
            return ResponseEntity.ok(MapUtils.of(
                "code", 200,
                "message", "success",
                "data", MapUtils.of(
                    "planId", planId,
                    "categoryStats", categoryStats
                )
            ));
            
        } catch (Exception e) {
            log.error("获取计划费用类别统计失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("code", 400, "message", e.getMessage()));
        }
    }
    
    /**
     * 获取计划的费用按日期统计
     * 
     * @param planId 计划ID
     * @return 费用统计
     */
    @GetMapping("/plans/{planId}/date-stats")
    public ResponseEntity<?> getDateStatsByPlan(@PathVariable Long planId) {
        try {
            Map<LocalDate, BigDecimal> dateStats = expenseService.getAmountByDateAndPlanId(planId);
            
            return ResponseEntity.ok(MapUtils.of(
                "code", 200,
                "message", "success",
                "data", MapUtils.of(
                    "planId", planId,
                    "dateStats", dateStats
                )
            ));
            
        } catch (Exception e) {
            log.error("获取计划费用日期统计失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("code", 400, "message", e.getMessage()));
        }
    }
    
    /**
     * 获取计划的预算分析
     * 
     * @param planId 计划ID
     * @return 预算分析结果
     */
    @GetMapping("/plans/{planId}/budget-analysis")
    public ResponseEntity<?> getBudgetAnalysis(@PathVariable Long planId) {
        try {
            Map<String, Object> analysis = expenseService.getBudgetAnalysis(planId);
            
            return ResponseEntity.ok(MapUtils.of(
                "code", 200,
                "message", "success",
                "data", analysis
            ));
            
        } catch (Exception e) {
            log.error("获取计划预算分析失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("code", 400, "message", e.getMessage()));
        }
    }
    
    /**
     * 获取AI预算优化建议
     * 
     * @param planId 计划ID
     * @param targetSavings 目标节省金额
     * @return AI优化建议
     */
    @PostMapping("/plans/{planId}/budget-optimization")
    public ResponseEntity<?> getBudgetOptimization(
            @PathVariable Long planId,
            @RequestParam BigDecimal targetSavings) {
        try {
            Map<String, Object> optimization = expenseService.getBudgetOptimization(planId, targetSavings);
            
            return ResponseEntity.ok(MapUtils.of(
                "code", 200,
                "message", "success",
                "data", optimization
            ));
            
        } catch (Exception e) {
            log.error("获取AI预算优化失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("code", 400, "message", e.getMessage()));
        }
    }
}
