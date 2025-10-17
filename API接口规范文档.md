# 旅游助手Web应用 - API接口规范文档

## 1. API概述

### 1.1 基础信息
- **基础URL**: `https://api.travelplanner.com/v1`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: JWT Bearer Token

### 1.2 统一响应格式
```json
{
    "code": 200,
    "message": "success",
    "data": {},
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123456789"
}
```

### 1.3 错误码定义
| 错误码 | 说明 | HTTP状态码 |
|--------|------|------------|
| 200 | 成功 | 200 |
| 400 | 请求参数错误 | 400 |
| 401 | 未授权 | 401 |
| 403 | 禁止访问 | 403 |
| 404 | 资源不存在 | 404 |
| 409 | 资源冲突 | 409 |
| 500 | 服务器内部错误 | 500 |

## 2. 用户认证相关API

### 2.1 用户注册
```http
POST /auth/register
Content-Type: application/json

{
    "username": "string",
    "email": "string",
    "password": "string",
    "confirmPassword": "string"
}
```

**响应示例:**
```json
{
    "code": 200,
    "message": "注册成功",
    "data": {
        "userId": 1,
        "username": "testuser",
        "email": "test@example.com",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expiresIn": 86400
    }
}
```

### 2.2 用户登录
```http
POST /auth/login
Content-Type: application/json

{
    "email": "string",
    "password": "string"
}
```

**响应示例:**
```json
{
    "code": 200,
    "message": "登录成功",
    "data": {
        "userId": 1,
        "username": "testuser",
        "email": "test@example.com",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expiresIn": 86400
    }
}
```

### 2.3 刷新Token
```http
POST /auth/refresh
Authorization: Bearer {token}
```

### 2.4 用户登出
```http
POST /auth/logout
Authorization: Bearer {token}
```

### 2.5 获取用户信息
```http
GET /auth/profile
Authorization: Bearer {token}
```

**响应示例:**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "userId": 1,
        "username": "testuser",
        "email": "test@example.com",
        "avatar": "https://example.com/avatar.jpg",
        "preferences": {
            "language": "zh-CN",
            "currency": "CNY",
            "theme": "light"
        },
        "createdAt": "2024-01-01T00:00:00Z"
    }
}
```

### 2.6 更新用户信息
```http
PUT /auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
    "username": "string",
    "avatar": "string",
    "preferences": {
        "language": "zh-CN",
        "currency": "CNY",
        "theme": "light"
    }
}
```

## 3. 行程管理相关API

### 3.1 获取行程列表
```http
GET /trips?page=1&size=10&status=draft
Authorization: Bearer {token}
```

**查询参数:**
- `page`: 页码，默认1
- `size`: 每页大小，默认10
- `status`: 行程状态 (draft, active, completed, cancelled)
- `sort`: 排序字段 (createdAt, updatedAt, startDate)
- `order`: 排序方向 (asc, desc)

**响应示例:**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "trips": [
            {
                "id": 1,
                "title": "日本东京5日游",
                "destination": "东京",
                "startDate": "2024-03-01",
                "endDate": "2024-03-05",
                "budget": 10000.00,
                "travelersCount": 2,
                "status": "draft",
                "createdAt": "2024-01-01T00:00:00Z",
                "updatedAt": "2024-01-01T00:00:00Z"
            }
        ],
        "pagination": {
            "page": 1,
            "size": 10,
            "total": 1,
            "totalPages": 1
        }
    }
}
```

### 3.2 创建行程
```http
POST /trips
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "string",
    "destination": "string",
    "startDate": "2024-03-01",
    "endDate": "2024-03-05",
    "budget": 10000.00,
    "travelersCount": 2,
    "preferences": {
        "interests": ["美食", "文化", "自然风光"],
        "accommodation": "酒店",
        "transportation": "飞机",
        "dining": "当地特色",
        "activities": ["观光", "购物", "体验"]
    }
}
```

**响应示例:**
```json
{
    "code": 200,
    "message": "行程创建成功",
    "data": {
        "id": 1,
        "title": "日本东京5日游",
        "destination": "东京",
        "startDate": "2024-03-01",
        "endDate": "2024-03-05",
        "budget": 10000.00,
        "travelersCount": 2,
        "status": "draft",
        "createdAt": "2024-01-01T00:00:00Z"
    }
}
```

### 3.3 获取行程详情
```http
GET /trips/{id}
Authorization: Bearer {token}
```

**响应示例:**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "title": "日本东京5日游",
        "destination": "东京",
        "startDate": "2024-03-01",
        "endDate": "2024-03-05",
        "budget": 10000.00,
        "travelersCount": 2,
        "preferences": {
            "interests": ["美食", "文化"],
            "accommodation": "酒店",
            "transportation": "飞机"
        },
        "status": "draft",
        "details": [
            {
                "dayNumber": 1,
                "date": "2024-03-01",
                "activities": [
                    {
                        "time": "09:00",
                        "type": "transportation",
                        "title": "抵达东京",
                        "description": "成田机场到达",
                        "location": "成田机场",
                        "duration": 120,
                        "cost": 0
                    }
                ],
                "accommodation": {
                    "name": "东京酒店",
                    "address": "东京都中央区",
                    "checkIn": "15:00",
                    "checkOut": "11:00",
                    "cost": 500.00
                },
                "meals": [
                    {
                        "time": "12:00",
                        "name": "拉面",
                        "location": "新宿",
                        "cost": 50.00
                    }
                ]
            }
        ],
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
    }
}
```

### 3.4 更新行程
```http
PUT /trips/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "string",
    "destination": "string",
    "startDate": "2024-03-01",
    "endDate": "2024-03-05",
    "budget": 10000.00,
    "travelersCount": 2,
    "preferences": {}
}
```

### 3.5 删除行程
```http
DELETE /trips/{id}
Authorization: Bearer {token}
```

### 3.6 AI生成行程规划
```http
POST /trips/{id}/plan
Authorization: Bearer {token}
Content-Type: application/json

{
    "requirements": "我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子",
    "regenerate": false
}
```

**响应示例:**
```json
{
    "code": 200,
    "message": "行程规划生成成功",
    "data": {
        "planId": "plan_123456",
        "status": "completed",
        "details": [
            {
                "dayNumber": 1,
                "date": "2024-03-01",
                "activities": [
                    {
                        "time": "09:00",
                        "type": "transportation",
                        "title": "抵达东京",
                        "description": "成田机场到达，乘坐机场快线到市区",
                        "location": "成田机场",
                        "coordinates": {
                            "lat": 35.7720,
                            "lng": 140.3928
                        },
                        "duration": 120,
                        "cost": 0,
                        "tips": "建议提前预订机场快线票"
                    },
                    {
                        "time": "12:00",
                        "type": "meal",
                        "title": "午餐 - 拉面",
                        "description": "品尝正宗日式拉面",
                        "location": "新宿拉面店",
                        "coordinates": {
                            "lat": 35.6909,
                            "lng": 139.7003
                        },
                        "duration": 60,
                        "cost": 50.00,
                        "tips": "推荐豚骨拉面"
                    }
                ],
                "accommodation": {
                    "name": "东京酒店",
                    "address": "东京都中央区",
                    "coordinates": {
                        "lat": 35.6762,
                        "lng": 139.6503
                    },
                    "checkIn": "15:00",
                    "checkOut": "11:00",
                    "cost": 500.00,
                    "rating": 4.5,
                    "amenities": ["WiFi", "早餐", "健身房"]
                }
            }
        ],
        "budgetAnalysis": {
            "totalEstimated": 10000.00,
            "breakdown": {
                "transportation": 3000.00,
                "accommodation": 2500.00,
                "meals": 2000.00,
                "activities": 1500.00,
                "shopping": 1000.00
            },
            "savings": [
                "选择经济型酒店可节省500元",
                "使用公共交通可节省200元"
            ]
        },
        "tips": [
            "建议提前预订热门景点门票",
            "准备现金，部分小店不支持刷卡",
            "下载翻译APP方便沟通"
        ]
    }
}
```

## 4. 费用管理相关API

### 4.1 获取费用记录
```http
GET /trips/{id}/expenses?page=1&size=10&category=meal
Authorization: Bearer {token}
```

**查询参数:**
- `page`: 页码
- `size`: 每页大小
- `category`: 费用类别 (transportation, accommodation, meal, activity, shopping, other)
- `startDate`: 开始日期
- `endDate`: 结束日期

**响应示例:**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "expenses": [
            {
                "id": 1,
                "category": "meal",
                "amount": 50.00,
                "currency": "CNY",
                "description": "午餐 - 拉面",
                "date": "2024-03-01",
                "location": "新宿拉面店",
                "createdAt": "2024-01-01T00:00:00Z"
            }
        ],
        "pagination": {
            "page": 1,
            "size": 10,
            "total": 1,
            "totalPages": 1
        }
    }
}
```

### 4.2 添加费用记录
```http
POST /trips/{id}/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
    "category": "meal",
    "amount": 50.00,
    "currency": "CNY",
    "description": "午餐 - 拉面",
    "date": "2024-03-01",
    "location": "新宿拉面店"
}
```

### 4.3 更新费用记录
```http
PUT /expenses/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "category": "meal",
    "amount": 60.00,
    "currency": "CNY",
    "description": "午餐 - 拉面（加蛋）",
    "date": "2024-03-01",
    "location": "新宿拉面店"
}
```

### 4.4 删除费用记录
```http
DELETE /expenses/{id}
Authorization: Bearer {token}
```

### 4.5 获取预算分析
```http
GET /trips/{id}/budget
Authorization: Bearer {token}
```

**响应示例:**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "budget": {
            "totalBudget": 10000.00,
            "totalSpent": 2500.00,
            "remaining": 7500.00,
            "percentage": 25.0
        },
        "breakdown": {
            "transportation": {
                "budget": 3000.00,
                "spent": 800.00,
                "remaining": 2200.00,
                "percentage": 26.7
            },
            "accommodation": {
                "budget": 2500.00,
                "spent": 1000.00,
                "remaining": 1500.00,
                "percentage": 40.0
            },
            "meal": {
                "budget": 2000.00,
                "spent": 500.00,
                "remaining": 1500.00,
                "percentage": 25.0
            },
            "activity": {
                "budget": 1500.00,
                "spent": 200.00,
                "remaining": 1300.00,
                "percentage": 13.3
            },
            "shopping": {
                "budget": 1000.00,
                "spent": 0.00,
                "remaining": 1000.00,
                "percentage": 0.0
            }
        },
        "trends": {
            "dailyAverage": 500.00,
            "projectedTotal": 5000.00,
            "savings": 5000.00
        },
        "recommendations": [
            "餐饮费用控制良好，可以适当增加体验活动",
            "住宿费用偏高，建议选择性价比更高的酒店",
            "购物预算充足，可以购买更多纪念品"
        ]
    }
}
```

## 5. AI服务相关API

### 5.1 语音转文字
```http
POST /ai/speech-to-text
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
    "audio": "file",
    "language": "zh-CN"
}
```

**响应示例:**
```json
{
    "code": 200,
    "message": "语音识别成功",
    "data": {
        "text": "我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子",
        "confidence": 0.95,
        "duration": 3.2
    }
}
```

### 5.2 AI优化预算
```http
POST /ai/optimize-budget
Authorization: Bearer {token}
Content-Type: application/json

{
    "tripId": 1,
    "currentBudget": 10000.00,
    "requirements": "希望节省20%的预算"
}
```

**响应示例:**
```json
{
    "code": 200,
    "message": "预算优化建议生成成功",
    "data": {
        "originalBudget": 10000.00,
        "optimizedBudget": 8000.00,
        "savings": 2000.00,
        "suggestions": [
            {
                "category": "accommodation",
                "originalCost": 2500.00,
                "optimizedCost": 1800.00,
                "savings": 700.00,
                "description": "选择经济型酒店或民宿",
                "impact": "住宿条件略有降低，但性价比更高"
            },
            {
                "category": "transportation",
                "originalCost": 3000.00,
                "optimizedCost": 2500.00,
                "savings": 500.00,
                "description": "选择经济舱航班和公共交通",
                "impact": "舒适度略有降低，但节省明显"
            }
        ],
        "alternatives": [
            "考虑淡季出行，可节省30%费用",
            "选择套餐式旅游产品，性价比更高",
            "提前预订可享受早鸟优惠"
        ]
    }
}
```

### 5.3 获取旅行建议
```http
POST /ai/travel-advice
Authorization: Bearer {token}
Content-Type: application/json

{
    "destination": "东京",
    "season": "春季",
    "travelers": 2,
    "interests": ["美食", "文化"]
}
```

## 6. 地图服务相关API

### 6.1 搜索地点
```http
GET /map/search?keyword=东京塔&city=东京
Authorization: Bearer {token}
```

**响应示例:**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "pois": [
            {
                "id": "poi_001",
                "name": "东京塔",
                "address": "东京都港区芝公园4-2-8",
                "coordinates": {
                    "lat": 35.6586,
                    "lng": 139.7454
                },
                "category": "landmark",
                "rating": 4.2,
                "openingHours": "09:00-23:00",
                "ticketPrice": 1200.00,
                "description": "东京的标志性建筑，可俯瞰城市全景"
            }
        ]
    }
}
```

### 6.2 计算路线
```http
POST /map/route
Authorization: Bearer {token}
Content-Type: application/json

{
    "origin": {
        "lat": 35.6762,
        "lng": 139.6503
    },
    "destination": {
        "lat": 35.6586,
        "lng": 139.7454
    },
    "mode": "walking"
}
```

**响应示例:**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "routes": [
            {
                "distance": 1200,
                "duration": 900,
                "steps": [
                    {
                        "instruction": "从起点出发",
                        "distance": 0,
                        "duration": 0,
                        "coordinates": {
                            "lat": 35.6762,
                            "lng": 139.6503
                        }
                    },
                    {
                        "instruction": "直行500米",
                        "distance": 500,
                        "duration": 300,
                        "coordinates": {
                            "lat": 35.6780,
                            "lng": 139.6520
                        }
                    }
                ]
            }
        ]
    }
}
```

## 7. 文件上传相关API

### 7.1 上传图片
```http
POST /upload/image
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
    "file": "file",
    "type": "avatar|trip|expense"
}
```

**响应示例:**
```json
{
    "code": 200,
    "message": "上传成功",
    "data": {
        "url": "https://oss.example.com/images/avatar_123456.jpg",
        "filename": "avatar_123456.jpg",
        "size": 1024000,
        "type": "image/jpeg"
    }
}
```

## 8. 系统配置相关API

### 8.1 获取系统配置
```http
GET /config
Authorization: Bearer {token}
```

### 8.2 更新API密钥配置
```http
PUT /config/api-keys
Authorization: Bearer {token}
Content-Type: application/json

{
    "amapApiKey": "your_amap_api_key",
    "xunfeiAppId": "your_xunfei_app_id",
    "xunfeiApiKey": "your_xunfei_api_key",
    "xunfeiApiSecret": "your_xunfei_api_secret",
    "qwenApiKey": "your_qwen_api_key"
}
```

## 9. API使用示例

### 9.1 完整的行程创建流程
```javascript
// 1. 用户登录
const loginResponse = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123'
    })
});

const { data: { token } } = await loginResponse.json();

// 2. 创建行程
const tripResponse = await fetch('/api/v1/trips', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        title: '日本东京5日游',
        destination: '东京',
        startDate: '2024-03-01',
        endDate: '2024-03-05',
        budget: 10000.00,
        travelersCount: 2,
        preferences: {
            interests: ['美食', '文化'],
            accommodation: '酒店',
            transportation: '飞机'
        }
    })
});

const { data: trip } = await tripResponse.json();

// 3. AI生成行程规划
const planResponse = await fetch(`/api/v1/trips/${trip.id}/plan`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        requirements: '我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子'
    })
});

const { data: plan } = await planResponse.json();
```

### 9.2 费用记录管理
```javascript
// 添加费用记录
const expenseResponse = await fetch(`/api/v1/trips/${tripId}/expenses`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        category: 'meal',
        amount: 50.00,
        currency: 'CNY',
        description: '午餐 - 拉面',
        date: '2024-03-01',
        location: '新宿拉面店'
    })
});

// 获取预算分析
const budgetResponse = await fetch(`/api/v1/trips/${tripId}/budget`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

const { data: budget } = await budgetResponse.json();
```

## 10. 错误处理

### 10.1 常见错误响应
```json
// 参数错误
{
    "code": 400,
    "message": "请求参数错误",
    "data": {
        "errors": [
            {
                "field": "email",
                "message": "邮箱格式不正确"
            }
        ]
    },
    "timestamp": "2024-01-01T00:00:00Z"
}

// 认证失败
{
    "code": 401,
    "message": "认证失败",
    "data": {
        "error": "INVALID_TOKEN"
    },
    "timestamp": "2024-01-01T00:00:00Z"
}

// 资源不存在
{
    "code": 404,
    "message": "行程不存在",
    "data": {
        "error": "TRIP_NOT_FOUND"
    },
    "timestamp": "2024-01-01T00:00:00Z"
}
```

### 10.2 错误处理建议
1. 始终检查响应状态码
2. 处理网络错误和超时
3. 实现重试机制
4. 提供用户友好的错误提示
5. 记录错误日志用于调试

## 11. 性能优化建议

### 11.1 请求优化
- 使用分页减少数据传输量
- 实现请求缓存
- 使用压缩传输
- 批量操作减少请求次数

### 11.2 响应优化
- 实现响应缓存
- 使用CDN加速静态资源
- 优化数据库查询
- 实现异步处理长时间操作

这个API接口规范文档提供了完整的接口定义，包括请求参数、响应格式、错误处理等，可以作为前后端开发的标准参考。
