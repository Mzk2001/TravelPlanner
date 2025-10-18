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
  ApiResponse,
  PageResponse,
  PlaceSearchResult,
  PlaceDetail
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
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
    size: number = 10,
    status?: string
  ): Promise<PageResponse<TravelPlan>> {
    const params: any = { userId, page, size };
    if (status) {
      params.status = status;
    }
    const response = await this.api.get('/plans', { params });
    return response.data;
  }

  async updatePlan(planId: number, planData: UpdatePlanRequest): Promise<TravelPlan> {
    const response = await this.api.put(`/plans/${planId}`, planData);
    return response.data;
  }

  async updatePlanStatus(planId: number, status: string): Promise<{ message: string }> {
    const response = await this.api.put(`/plans/${planId}/status`, { status });
    return response.data;
  }

  async deletePlan(planId: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/plans/${planId}`);
    return response.data;
  }

  // 对话相关API
  async sendMessage(chatData: ChatRequest): Promise<ChatResponse> {
    const response = await this.api.post('/conversations/chat', chatData);
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
    const response = await this.api.get('/conversations', { params });
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
