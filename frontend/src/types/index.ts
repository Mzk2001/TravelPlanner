// 用户相关类型
// export interface User {
//   id: number
//   username: string
//   email: string
//   role: 'USER' | 'ADMIN'
//   createdAt: string
//   updatedAt: string
// }

// export interface LoginRequest {
//   username: string
//   password: string
// }

// export interface RegisterRequest {
//   username: string
//   password: string
//   email: string
// }

// 旅游计划相关类型
// export type PlanStatus = 'DRAFT' | 'PLANNING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

// export interface TravelPlan {
//   id: number
//   userId: number
//   planName: string
//   destination: string
//   startDate: string
//   endDate: string
//   budget: number
//   travelType: string
//   groupSize: number
//   specialRequirements?: string
//   status: PlanStatus
//   createdAt: string
//   updatedAt: string
// }

// export interface CreatePlanRequest {
//   userId: number
//   planName: string
//   destination: string
//   startDate: string
//   endDate: string
//   budget: number
//   travelType: string
//   groupSize: number
//   specialRequirements?: string
// }

// export interface UpdatePlanRequest {
//   planName?: string
//   destination?: string
//   startDate?: string
//   endDate?: string
//   budget?: number
//   travelType?: string
//   groupSize?: number
//   specialRequirements?: string
// }

// 对话记录相关类型
// export interface Conversation {
//   id: number
//   userId: number
//   planId?: number
//   message: string
//   response: string
//   createdAt: string
// }

// API响应类型
// export interface ApiResponse<T> {
//   success: boolean
//   data: T
//   message?: string
// }

// export interface PaginatedResponse<T> {
//   content: T[]
//   totalElements: number
//   totalPages: number
//   size: number
//   number: number
// }

// 暂时注释掉所有TypeScript类型定义，避免构建错误


