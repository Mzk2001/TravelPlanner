package com.travelplanner.repository;

import com.travelplanner.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 费用记录数据访问层
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    /**
     * 根据计划ID查找费用记录
     * 
     * @param planId 计划ID
     * @param pageable 分页参数
     * @return 费用记录分页列表
     */
    Page<Expense> findByPlanIdOrderByExpenseDateDesc(Long planId, Pageable pageable);
    
    /**
     * 根据用户ID查找费用记录
     * 
     * @param userId 用户ID
     * @param pageable 分页参数
     * @return 费用记录分页列表
     */
    Page<Expense> findByUserIdOrderByExpenseDateDesc(Long userId, Pageable pageable);
    
    /**
     * 根据计划ID和用户ID查找费用记录
     * 
     * @param planId 计划ID
     * @param userId 用户ID
     * @param pageable 分页参数
     * @return 费用记录分页列表
     */
    Page<Expense> findByPlanIdAndUserIdOrderByExpenseDateDesc(Long planId, Long userId, Pageable pageable);
    
    /**
     * 根据计划ID和费用类别查找费用记录
     * 
     * @param planId 计划ID
     * @param category 费用类别
     * @param pageable 分页参数
     * @return 费用记录分页列表
     */
    Page<Expense> findByPlanIdAndCategoryOrderByExpenseDateDesc(Long planId, Expense.ExpenseCategory category, Pageable pageable);
    
    /**
     * 根据计划ID和日期范围查找费用记录
     * 
     * @param planId 计划ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param pageable 分页参数
     * @return 费用记录分页列表
     */
    Page<Expense> findByPlanIdAndExpenseDateBetweenOrderByExpenseDateDesc(
        Long planId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    /**
     * 计算计划的总费用
     * 
     * @param planId 计划ID
     * @return 总费用
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.planId = :planId")
    BigDecimal getTotalAmountByPlanId(@Param("planId") Long planId);
    
    /**
     * 计算计划的费用按类别统计
     * 
     * @param planId 计划ID
     * @return 费用统计列表
     */
    @Query("SELECT e.category, COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.planId = :planId GROUP BY e.category")
    List<Object[]> getAmountByCategoryAndPlanId(@Param("planId") Long planId);
    
    /**
     * 计算用户的费用按类别统计
     * 
     * @param userId 用户ID
     * @return 费用统计列表
     */
    @Query("SELECT e.category, COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.userId = :userId GROUP BY e.category")
    List<Object[]> getAmountByCategoryAndUserId(@Param("userId") Long userId);
    
    /**
     * 计算计划的费用按日期统计
     * 
     * @param planId 计划ID
     * @return 费用统计列表
     */
    @Query("SELECT e.expenseDate, COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.planId = :planId GROUP BY e.expenseDate ORDER BY e.expenseDate")
    List<Object[]> getAmountByDateAndPlanId(@Param("planId") Long planId);
    
    /**
     * 查找计划中指定日期的费用记录
     * 
     * @param planId 计划ID
     * @param expenseDate 费用日期
     * @return 费用记录列表
     */
    List<Expense> findByPlanIdAndExpenseDateOrderByCreatedAtDesc(Long planId, LocalDate expenseDate);
    
    /**
     * 根据计划ID和货币类型查找费用记录
     * 
     * @param planId 计划ID
     * @param currency 货币类型
     * @param pageable 分页参数
     * @return 费用记录分页列表
     */
    Page<Expense> findByPlanIdAndCurrencyOrderByExpenseDateDesc(Long planId, String currency, Pageable pageable);
}


