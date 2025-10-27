# 旅游助手Web应用

## 🎯 项目概述

这是一个基于Spring Boot + React的智能旅游规划平台，集成了AI大语言模型（通义千问）和地图服务（百度地图），为用户提供个性化的旅游计划生成服务。

## ✨ 主要功能

### 🔐 用户管理
- 用户注册/登录
- JWT身份认证
- 个人资料管理

### 🤖 AI智能助手
- 基于通义千问的旅游计划生成
- 文本对话交互
- 语音交互（科大讯飞）
- 上下文记忆

### 🗺️ 地图服务
- 地点搜索
- 路径规划
- 距离计算
- 天气查询

### 📋 旅游计划管理
- 创建/编辑/删除旅游计划
- 计划状态跟踪
- 历史记录查看

## 🏗️ 技术架构

### 后端技术栈
- **框架**: Spring Boot 3.2
- **数据库**: PostgreSQL 15 + H2 (开发测试)
- **安全**: Spring Security + JWT
- **API文档**: OpenAPI 3 (Swagger)
- **构建工具**: Maven 3.8+

### 前端技术栈
- **框架**: React 18
- **UI库**: Ant Design 5
- **路由**: React Router 6
- **HTTP客户端**: Axios
- **构建工具**: Create React App

### 第三方服务
- **AI服务**: 阿里通义千问
- **语音服务**: 科大讯飞
- **地图服务**: 百度地图API

## 📁 项目结构

```
TravelPlanner/
├── backend/                 # 后端Spring Boot应用
│   ├── src/main/java/com/travelplanner/
│   │   ├── config/         # 配置类
│   │   ├── controller/     # 控制器层
│   │   ├── entity/         # 实体类
│   │   ├── repository/     # 数据访问层
│   │   ├── service/        # 业务逻辑层
│   │   ├── security/       # 安全相关
│   │   └── TravelPlannerApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml # 主配置文件
│   │   └── application-h2.yml # H2数据库配置
│   └── pom.xml
├── frontend/               # 前端React应用
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API服务
│   │   ├── contexts/     # React上下文
│   │   └── App.js
│   ├── public/
│   └── package.json
├── docs/                   # 项目文档
├── docker-compose.yml      # Docker编排文件
└── README.md
```

## 🚀 快速开始

### 环境要求
- Java 17+
- Node.js 18+
- Maven 3.8+
- PostgreSQL 15 (可选，可使用H2)

### 1. 克隆项目
```bash
git clone <repository-url>
cd TravelPlanner
```

### 2. 配置环境变量
```bash
cp env.example .env
# 编辑.env文件，填入API密钥
```

### 3. 启动后端服务

#### 使用H2数据库（推荐用于开发）
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

#### 使用PostgreSQL
```bash
# 1. 启动PostgreSQL服务
# 2. 创建数据库
createdb travel_planner

# 3. 执行初始化脚本
psql -d travel_planner -f init.sql

# 4. 启动应用
cd backend
mvn spring-boot:run
```

### 4. 启动前端服务
```bash
cd frontend
npm install
npm start
```

### 5. 访问应用
- 前端界面: http://localhost:3000
- 后端API: http://localhost:8080/api
- API文档: http://localhost:8080/api/swagger-ui.html
- H2控制台: http://localhost:8080/api/h2-console

## 🔧 配置说明

### API密钥配置
在`.env`文件中配置以下API密钥：

```env
# 百度地图API
BAIDU_API_KEY=your_baidu_api_key

# 科大讯飞API
XUNFEI_APP_ID=your_xunfei_app_id
XUNFEI_API_KEY=your_xunfei_api_key
XUNFEI_API_SECRET=your_xunfei_api_secret

# 阿里通义千问API
QWEN_API_KEY=your_qwen_api_key

# JWT密钥
JWT_SECRET=your_jwt_secret_key
```

### 数据库配置
默认使用H2内存数据库，无需额外配置。如需使用PostgreSQL，请修改`application.yml`中的数据库配置。

## 📚 API文档

### 认证相关
- `POST /auth/login` - 用户登录
- `POST /auth/validate` - 验证令牌

### 用户管理
- `POST /users/register` - 用户注册
- `GET /users/{id}` - 获取用户信息
- `PUT /users/{id}` - 更新用户信息

### 旅游计划
- `POST /plans` - 创建旅游计划
- `GET /plans/{id}` - 获取计划详情
- `GET /plans` - 获取用户计划列表
- `PUT /plans/{id}` - 更新计划
- `DELETE /plans/{id}` - 删除计划

### AI对话
- `POST /conversations/chat` - 发送文本消息
- `POST /conversations/voice` - 发送语音消息
- `GET /conversations` - 获取对话历史

### 地图服务
- `GET /conversations/search/places` - 搜索地点
- `GET /conversations/places/{id}` - 获取地点详情

## 🐳 Docker部署

### 使用Docker Compose
```bash
docker-compose up -d
```

### 手动构建
```bash
# 构建后端镜像
cd backend
docker build -t travel-planner-backend .

# 构建前端镜像
cd ../frontend
docker build -t travel-planner-frontend .

# 运行容器
docker run -d -p 8080:8080 travel-planner-backend
docker run -d -p 3000:3000 travel-planner-frontend
```

## 🧪 测试

### 后端测试
```bash
cd backend
mvn test
```

### 前端测试
```bash
cd frontend
npm test
```

## 📝 开发指南

### 代码规范
- 后端遵循Java编码规范
- 前端使用ESLint + Prettier
- 提交信息使用约定式提交格式

### 分支管理
- `main`: 主分支，用于生产环境
- `develop`: 开发分支
- `feature/*`: 功能分支
- `hotfix/*`: 热修复分支

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目维护者: TravelPlanner Team
- 邮箱: contact@travelplanner.com
- 项目链接: https://github.com/travelplanner/web-app

## 🙏 致谢

感谢以下开源项目和服务：
- Spring Boot
- React
- Ant Design
- 阿里通义千问
- 科大讯飞
- 百度地图


