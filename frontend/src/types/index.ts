// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface UpdateUserRequest {
  email?: string;
  phone?: string;
  fullName?: string;
  avatarUrl?: string;
}

// 旅游计划相关类型
export interface TravelPlan {
  id: number;
  userId: number;
  planName: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelType: string;
  groupSize: number;
  specialRequirements?: string;
  status: 'DRAFT' | 'PLANNING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  aiGenerated?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanRequest {
  userId: number;
  planName: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelType: string;
  groupSize: number;
  specialRequirements?: string;
}

export interface UpdatePlanRequest {
  planName?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  travelType?: string;
  groupSize?: number;
  specialRequirements?: string;
}

export interface UpdateStatusRequest {
  status: string;
}

// 对话相关类型
export interface Conversation {
  id: number;
  userId: number;
  planId?: number;
  userMessage: string;
  aiResponse: string;
  messageType: 'text' | 'voice';
  voiceFileUrl?: string;
  processingTime: number;
  createdAt: string;
}

export interface ChatRequest {
  userId: number;
  planId?: number;
  message: string;
  apiKey?: string;
}

export interface ChatResponse {
  message: string;
  processingTime: number;
  timestamp: string;
}

export interface VoiceChatResponse {
  userMessage: string;
  aiResponse: string;
  voiceFileUrl?: string;
  processingTime: number;
  timestamp: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
}

// 地图相关类型
export interface PlaceSearchResult {
  id: string;
  name: string;
  address: string;
  location: {
    lng: number;
    lat: number;
  };
  distance?: number;
}

export interface PlaceDetail {
  id: string;
  name: string;
  address: string;
  location: {
    lng: number;
    lat: number;
  };
  phone?: string;
  website?: string;
  rating?: number;
  photos?: string[];
  description?: string;
}

// 费用管理相关类型
export interface Expense {
  id: number;
  planId: number;
  userId: number;
  category: 'TRANSPORTATION' | 'ACCOMMODATION' | 'MEAL' | 'ACTIVITY' | 'SHOPPING' | 'HEALTH' | 'ENTERTAINMENT' | 'OTHER';
  amount: number;
  currency: string;
  description?: string;
  location?: string;
  expenseDate: string;
  paymentMethod?: string;
  receiptUrl?: string;
  tags?: string;
  isReimbursable: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  planId: number;
  userId: number;
  category: string;
  amount: number;
  currency?: string;
  description?: string;
  location?: string;
  expenseDate: string;
  paymentMethod?: string;
  receiptUrl?: string;
  tags?: string;
  isReimbursable?: boolean;
  notes?: string;
}

export interface UpdateExpenseRequest {
  category?: string;
  amount?: number;
  currency?: string;
  description?: string;
  location?: string;
  expenseDate?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  tags?: string;
  isReimbursable?: boolean;
  notes?: string;
}

export interface ExpenseStats {
  planId: number;
  totalAmount: number;
  categoryStats: Record<string, number>;
  dateStats: Record<string, number>;
}

export interface BudgetAnalysis {
  planId: number;
  totalBudget: number;
  totalExpense: number;
  remainingBudget: number;
  budgetUtilization: number;
  categoryBreakdown: Record<string, number>;
  basicSuggestions: string[];
  aiAnalysis?: string;
  hasAiAnalysis: boolean;
}

export interface BudgetOptimization {
  planId: number;
  currentBudget: number;
  targetSavings: number;
  optimizedBudget: number;
  aiOptimization?: string;
  hasAiOptimization: boolean;
}