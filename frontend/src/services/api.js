import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 增加到2分钟，给AI生成更多时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  validateToken: (token) => 
    api.post('/auth/validate', { token }),
};

// 用户相关API
export const userAPI = {
  register: (userData) => 
    api.post('/users/register', userData),
  
  getUser: (userId) => 
    api.get(`/users/${userId}`),
  
  updateUser: (userId, userData) => 
    api.put(`/users/${userId}`, userData),
};

// 旅游计划相关API
export const planAPI = {
  createPlan: (planData) => 
    api.post('/plans', planData),
  
  getPlan: (planId) => 
    api.get(`/plans/${planId}`),
  
  getUserPlans: (userId, page = 0, size = 10) => {
    const params = { userId, page, size };
    return api.get('/plans', { params });
  },
  
  updatePlan: (planId, planData) => 
    api.put(`/plans/${planId}`, planData),
  
  
  deletePlan: (planId) => 
    api.delete(`/plans/${planId}`),
};

// 对话相关API
export const conversationAPI = {
  sendMessage: (messageData) => 
    api.post('/conversations/chat', messageData),
  
  sendVoiceMessage: (formData) => 
    api.post('/conversations/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  getConversations: (userId, planId = null, page = 0, size = 20) => {
    const params = { userId, page, size };
    if (planId) params.planId = planId;
    return api.get('/conversations', { params });
  },
  
  searchPlaces: (keyword, city = null) => {
    const params = { keyword };
    if (city) params.city = city;
    return api.get('/conversations/search/places', { params });
  },
  
  getPlaceDetail: (placeId) => 
    api.get(`/conversations/places/${placeId}`),
  
  saveAsPlan: (planData) => 
    api.post('/conversations/save-as-plan-direct', planData),
  
  saveAsPlanWithFields: (planData) => 
    api.post('/conversations/save-as-plan-with-fields', planData),
  
  deleteConversations: (userId, planId = null) => {
    const params = { userId };
    if (planId) params.planId = planId;
    return api.delete('/conversations', { params });
  },
};

// 费用管理相关API
export const expenseAPI = {
  createExpense: (expenseData) => 
    api.post('/expenses', expenseData),
  
  getExpenses: (planId, page = 0, size = 10) => 
    api.get(`/expenses/plans/${planId}`, { params: { page, size } }),
  
  getExpense: (expenseId) => 
    api.get(`/expenses/${expenseId}`),
  
  updateExpense: (expenseId, expenseData) => 
    api.put(`/expenses/${expenseId}`, expenseData),
  
  deleteExpense: (expenseId) => 
    api.delete(`/expenses/${expenseId}`),
  
  getExpenseSummary: (planId) => 
    api.get(`/expenses/plans/${planId}/budget-analysis`),
  
  getBudgetAnalysis: async (planId) => {
    try {
      console.log('Calling budget analysis API for planId:', planId);
      const response = await api.get(`/expenses/plans/${planId}/budget-analysis`);
      console.log('Budget analysis API response:', response.data);
      
      // 检查响应结构
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        // 如果直接返回数据，没有包装在data字段中
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Budget analysis API error:', error);
      throw error;
    }
  },
};

// API Key管理相关API
export const apiKeyAPI = {
  saveApiKey: async (userId, apiKey) => {
    const response = await api.post(`/users/${userId}/api-key`, { apiKey });
    return response.data;
  },
  
  getApiKeyStatus: async (userId) => {
    const response = await api.get(`/users/${userId}/api-key/status`);
    return response.data;
  },
  
  deleteApiKey: async (userId) => {
    const response = await api.delete(`/users/${userId}/api-key`);
    return response.data;
  },
  
  testApiKey: async (apiKey) => {
    const response = await api.post('/ai/test', { apiKey });
    return response.data;
  },
};

// 默认导出包含所有API方法的对象
const apiService = {
  // 认证相关
  login: authAPI.login,
  validateToken: authAPI.validateToken,
  
  // 用户相关
  register: userAPI.register,
  getUser: userAPI.getUser,
  updateUser: userAPI.updateUser,
  
  // 旅游计划相关
  createPlan: planAPI.createPlan,
  getPlan: planAPI.getPlan,
  getUserPlans: planAPI.getUserPlans,
  updatePlan: planAPI.updatePlan,
  deletePlan: planAPI.deletePlan,
  
  // 对话相关
  sendMessage: conversationAPI.sendMessage,
  sendVoiceMessage: conversationAPI.sendVoiceMessage,
  getConversations: conversationAPI.getConversations,
  searchPlaces: conversationAPI.searchPlaces,
  getPlaceDetail: conversationAPI.getPlaceDetail,
  saveAsPlan: conversationAPI.saveAsPlan,
  saveAsPlanWithFields: conversationAPI.saveAsPlanWithFields,
  deleteConversations: conversationAPI.deleteConversations,
  
  // 费用管理相关
  createExpense: expenseAPI.createExpense,
  getExpenses: expenseAPI.getExpenses,
  getExpense: expenseAPI.getExpense,
  updateExpense: expenseAPI.updateExpense,
  deleteExpense: expenseAPI.deleteExpense,
  getExpenseSummary: expenseAPI.getExpenseSummary,
  getBudgetAnalysis: expenseAPI.getBudgetAnalysis,
  
  // 预算优化相关
  getBudgetOptimization: (planId, targetSavings) => 
    api.post(`/expenses/plans/${planId}/budget-optimization?targetSavings=${targetSavings}`),
  
  // API Key管理相关
  saveApiKey: apiKeyAPI.saveApiKey,
  getApiKeyStatus: apiKeyAPI.getApiKeyStatus,
  deleteApiKey: apiKeyAPI.deleteApiKey,
  testApiKey: apiKeyAPI.testApiKey,
};

export default apiService;


