const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';

async function testBudgetAnalysis() {
  try {
    console.log('测试预算分析API...');
    
    // 1. 先获取一个旅游计划
    const plansResponse = await axios.get(`${API_BASE_URL}/plans?userId=1&page=0&size=10`);
    console.log('旅游计划列表:', plansResponse.data);
    
    if (plansResponse.data && plansResponse.data.length > 0) {
      const planId = plansResponse.data[0].id;
      console.log(`使用计划ID: ${planId}`);
      
      // 2. 获取预算分析
      const budgetResponse = await axios.get(`${API_BASE_URL}/expenses/plans/${planId}/budget-analysis`);
      console.log('预算分析结果:', JSON.stringify(budgetResponse.data, null, 2));
      
      // 3. 检查计划详情
      const planDetailResponse = await axios.get(`${API_BASE_URL}/plans/${planId}`);
      console.log('计划详情:', JSON.stringify(planDetailResponse.data, null, 2));
      
    } else {
      console.log('没有找到旅游计划，请先创建一个计划');
    }
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testBudgetAnalysis();