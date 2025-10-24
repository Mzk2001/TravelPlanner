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
};

export default api;


