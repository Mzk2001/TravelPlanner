import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateUserRequest,
  TravelPlan,
  CreatePlanRequest,
  UpdatePlanRequest,
  UpdateStatusRequest,
  Conversation,
  ChatRequest,
  ChatResponse,
  VoiceChatResponse,
  ExtractedFields,
  ApiResponse,
  PageResponse,
  PlaceSearchResult,
  PlaceDetail,
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseStats,
  BudgetAnalysis,
  BudgetOptimization
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 120000, // 增加到2分钟，给AI生成更多时间
      headers: {
        'Content-Type': 'application/json',
      },
      transformRequest: [(data) => {
        console.log('发送的数据:', data);
        return JSON.stringify(data);
      }],
    });

    // 请求拦截器 - 添加认证token
    this.api.interceptors.request.use(
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
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
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
  }

  // 认证相关API
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async validateToken(token: string): Promise<{ valid: boolean; username?: string; userId?: number }> {
    const response = await this.api.post('/auth/validate', { token });
    return response.data;
  }

  // 用户相关API
  async register(userData: RegisterRequest): Promise<User> {
    const response = await this.api.post('/users/register', userData);
    return response.data;
  }

  async getUser(userId: number): Promise<User> {
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: number, userData: UpdateUserRequest): Promise<User> {
    const response = await this.api.put(`/users/${userId}`, userData);
    return response.data;
  }

  // 旅游计划相关API
  async createPlan(planData: CreatePlanRequest): Promise<TravelPlan> {
    const response = await this.api.post('/plans', planData);
    return response.data;
  }

  async getPlan(planId: number): Promise<TravelPlan> {
    const response = await this.api.get(`/plans/${planId}`);
    return response.data;
  }

  async getUserPlans(
    userId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<TravelPlan>> {
    const params: any = { userId, page, size };
    const response = await this.api.get('/plans', { params });
    return response.data;
  }

  async updatePlan(planId: number, planData: UpdatePlanRequest): Promise<TravelPlan> {
    const response = await this.api.put(`/plans/${planId}`, planData);
    return response.data;
  }


  async deletePlan(planId: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/plans/${planId}`);
    return response.data;
  }

  // 对话相关API
  async sendMessage(chatData: ChatRequest): Promise<ChatResponse> {
    console.log('🌐 API调用: sendMessage', chatData);
    // 为聊天API单独设置更长的超时时间
    const response = await this.api.post('/conversations/chat', chatData, {
      timeout: 120000 // 2分钟超时，给AI生成足够时间
    });
    console.log('📡 API响应: sendMessage', response.data);
    console.log('📋 响应中的extractedFields:', response.data.extractedFields);
    return response.data;
  }

  // AI生成旅游计划
  async generateTravelPlan(apiKey: string, userMessage: string, planContext?: string): Promise<{ success: boolean; result: string }> {
    const response = await this.api.post('/ai/generate', {
      apiKey,
      userMessage,
      planContext: planContext || ''
    });
    return response.data;
  }

  async sendVoiceMessage(
    userId: number,
    planId: number | undefined,
    audioFile: File
  ): Promise<VoiceChatResponse> {
    const formData = new FormData();
    formData.append('userId', userId.toString());
    if (planId) {
      formData.append('planId', planId.toString());
    }
    formData.append('audio', audioFile);

    const response = await this.api.post('/conversations/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getConversations(
    userId: number,
    planId?: number,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<Conversation>> {
    const params: any = { userId, page, size };
    if (planId) {
      params.planId = planId;
    }
    console.log('🌐 API调用: getConversations', { params });
    const response = await this.api.get('/conversations', { params });
    console.log('📡 API响应: getConversations', response.data);
    
    // 检查响应中的extractedFields
    if (response.data?.content) {
      response.data.content.forEach((conv: any, index: number) => {
        console.log(`📋 API对话 ${index + 1} extractedFields:`, {
          id: conv.id,
          extractedFields: conv.extractedFields,
          hasExtractedFields: !!conv.extractedFields,
          extractedFieldsType: typeof conv.extractedFields
        });
      });
    }
    
    return response.data;
  }

  // 地图相关API
  async searchPlaces(keyword: string, city?: string): Promise<PlaceSearchResult[]> {
    const params: any = { keyword };
    if (city) {
      params.city = city;
    }
    const response = await this.api.get('/conversations/search/places', { params });
    return response.data;
  }

  async getPlaceDetail(placeId: string): Promise<PlaceDetail> {
    const response = await this.api.get(`/conversations/places/${placeId}`);
    return response.data;
  }

  async saveAsPlan(userId: number, conversationId: number): Promise<{ planId: number; message: string }> {
    const response = await this.api.post('/conversations/save-as-plan', {
      userId,
      conversationId
    });
    return response.data;
  }

  async saveAsPlanWithFields(
    userId: number, 
    aiResponse: string, 
    extractedFields: ExtractedFields
  ): Promise<{ planId: number; message: string }> {
    const response = await this.api.post('/conversations/save-as-plan-with-fields', {
      userId,
      aiResponse,
      extractedFields
    });
    return response.data;
  }

  // 费用管理相关API
  async createExpense(expenseData: CreateExpenseRequest): Promise<Expense> {
    const response = await this.api.post('/expenses', expenseData);
    return response.data.data;
  }

  async getExpense(expenseId: number): Promise<Expense> {
    const response = await this.api.get(`/expenses/${expenseId}`);
    return response.data.data;
  }

  async updateExpense(expenseId: number, expenseData: UpdateExpenseRequest): Promise<Expense> {
    const response = await this.api.put(`/expenses/${expenseId}`, expenseData);
    return response.data.data;
  }

  async deleteExpense(expenseId: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/expenses/${expenseId}`);
    return response.data;
  }

  async getExpensesByPlan(
    planId: number,
    page: number = 0,
    size: number = 10,
    category?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ expenses: Expense[]; pagination: any }> {
    const params: any = { page, size };
    if (category) params.category = category;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await this.api.get(`/expenses/plans/${planId}`, { params });
    return response.data.data;
  }

  async getExpensesByUser(
    userId: number,
    page: number = 0,
    size: number = 10
  ): Promise<{ expenses: Expense[]; pagination: any }> {
    const response = await this.api.get(`/expenses/users/${userId}`, {
      params: { page, size }
    });
    return response.data.data;
  }

  async getTotalAmountByPlan(planId: number): Promise<{ planId: number; totalAmount: number }> {
    const response = await this.api.get(`/expenses/plans/${planId}/total`);
    return response.data.data;
  }

  async getCategoryStatsByPlan(planId: number): Promise<{ planId: number; categoryStats: Record<string, number> }> {
    const response = await this.api.get(`/expenses/plans/${planId}/category-stats`);
    return response.data.data;
  }

  async getDateStatsByPlan(planId: number): Promise<{ planId: number; dateStats: Record<string, number> }> {
    const response = await this.api.get(`/expenses/plans/${planId}/date-stats`);
    return response.data.data;
  }

  async getBudgetAnalysis(planId: number): Promise<BudgetAnalysis> {
    const response = await this.api.get(`/expenses/plans/${planId}/budget-analysis`);
    return response.data.data;
  }

  async getBudgetOptimization(planId: number, targetSavings: number): Promise<BudgetOptimization> {
    const response = await this.api.post(`/expenses/plans/${planId}/budget-optimization?targetSavings=${targetSavings}`);
    return response.data.data;
  }

  // AI服务测试API
  async testAiService(apiKey: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('发送AI测试请求:', { apiKey });
      const response = await fetch(`${this.baseURL}/ai/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey })
      });
      
      const data = await response.json();
      console.log('AI测试响应:', data);
      return data;
    } catch (error: any) {
      console.error('AI测试错误:', error);
      return {
        success: false,
        message: error.message || '测试失败'
      };
    }
  }

  // 工具方法
  setAuthToken(token: string) {
    localStorage.setItem('token', token);
  }

  removeAuthToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export default new ApiService();
