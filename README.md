# TravelPlanner - 智能旅游助手

基于大语言模型的智能旅游规划Web应用，集成阿里通义千问和百度地图服务。

## 🏗️ 项目架构

```
TravelPlanner/
├── backend/                 # Spring Boot后端服务
│   ├── src/                # Java源代码
│   │   ├── main/java/com/travelplanner/
│   │   │   ├── entity/     # 实体类
│   │   │   ├── repository/ # 数据访问层
│   │   │   ├── service/    # 业务逻辑层
│   │   │   ├── controller/ # 控制器层
│   │   │   ├── security/   # 安全配置
│   │   │   └── config/     # 配置类
│   │   └── resources/       # 配置文件
│   ├── pom.xml             # Maven配置
│   └── Dockerfile          # 后端Docker配置
├── frontend/               # React前端应用
│   ├── src/                # React源代码
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   ├── types/          # TypeScript类型
│   │   ├── contexts/       # React Context
│   │   └── hooks/          # 自定义Hooks
│   ├── package.json        # Node.js依赖
│   ├── Dockerfile          # 前端Docker配置
│   └── nginx.conf          # Nginx配置
├── docker-compose.yml      # 服务编排
├── build-docker.bat        # Windows构建脚本
├── build-docker.sh         # Linux/Mac构建脚本
└── env.example             # 环境变量示例
```

## 🚀 技术栈

### 后端技术
- **框架**: Spring Boot 2.7.18
- **语言**: Java 8
- **数据库**: H2 (内存数据库)
- **ORM**: Spring Data JPA
- **安全**: Spring Security + JWT
- **构建**: Maven
- **HTTP客户端**: WebFlux

### 前端技术
- **框架**: React 18 + TypeScript
- **构建**: Create React App
- **UI库**: Ant Design + Material-UI
- **路由**: React Router
- **HTTP**: Axios
- **状态**: React Hooks + Context
- **图表**: Recharts

### 基础设施
- **容器化**: Docker + Docker Compose
- **数据库**: H2 (内存数据库，无需外部数据库)
- **部署**: 单容器部署
- **语音服务**: 浏览器原生Web Speech API（支持实时语音识别）

## 🎯 核心功能

### 1. 用户管理
- 用户注册/登录
- 个人信息管理
- JWT身份认证

### 2. 旅游计划管理
- 创建旅游计划
- 计划详情查看
- 计划状态管理
- 计划编辑/删除

### 3. AI智能规划
- 集成阿里通义千问大语言模型
- 智能行程推荐
- 个性化旅游建议

### 4. 语音交互
- 基于浏览器原生Web Speech API的实时语音识别
- 支持中文语音输入和实时转录
- 语音回复生成（文本转语音）
- 支持音频文件上传和处理

### 5. 地图服务
- 集成百度地图API
- 地理位置服务
- 路线规划

## 🛠️ 快速开始

### 环境要求
- Docker & Docker Compose
- 无需安装Java、Maven、Node.js或数据库

### 1. 克隆项目
```bash
git clone <repository-url>
cd TravelPlanner
```

### 2. 一键部署（推荐）
```bash
# Windows用户
build-docker.bat

# Linux/Mac用户
chmod +x build-docker.sh
./build-docker.sh

# 启动应用
docker-compose up -d
```

### 3. 手动构建部署
```bash
# 进入后端目录
cd backend

# 编译和打包
mvn clean package -DskipTests

# 复制依赖
mvn dependency:copy-dependencies -DoutputDirectory=target/dependency

# 返回根目录
cd ..

# 构建Docker镜像
docker build -t travel-planner:latest ./backend

# 启动应用
docker-compose up -d
```

### 4. 访问应用
- **后端API**: http://localhost:8080/api
- **健康检查**: http://localhost:8080/api/health
- **测试用户**: username: `test`, password: `password` (仅用于演示)

### 5. 端口冲突解决
如果8080端口被占用，可以修改端口：
```bash
# 修改docker-compose.yml中的端口映射
ports:
  - "8081:8080"  # 使用8081端口访问

# 或者停止占用8080端口的服务
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

### 6. 查看日志
```bash
# 查看应用日志
docker-compose logs -f travel-planner

# 查看服务状态
docker-compose ps
```

## 📖 开发指南

### 本地开发

#### 后端开发
```bash
# 进入后端目录
cd backend

# 编译运行（使用H2内存数据库）
mvn clean compile
mvn spring-boot:run
```

#### 前端开发
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 数据库说明
- **H2内存数据库**: 应用启动时自动创建，重启后数据会重置
- **开发模式**: 使用内存数据库，适合开发和测试
- **无需外部数据库**: 应用内置H2数据库，无需安装PostgreSQL等数据库
- **数据初始化**: 通过`data.sql`文件自动创建测试用户

### API测试
```bash
# 用户注册
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",  // 演示用密码，生产环境请使用强密码
    "email": "test@example.com"
  }'

# 创建旅游计划
curl -X POST http://localhost:8080/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "planName": "北京三日游",
    "destination": "北京",
    "startDate": "2024-01-01T00:00:00",
    "endDate": "2024-01-03T23:59:59",
    "budget": 3000.0,
    "travelType": "休闲",
    "groupSize": 2,
    "specialRequirements": "希望参观故宫和长城"
  }'
```

## 🔧 配置说明

### 环境变量配置
```bash
# JWT密钥
JWT_SECRET=travelplanner-secret-key-2024

# 百度地图API
BAIDU_API_KEY=your_baidu_api_key

# 语音识别服务（使用浏览器原生Web Speech API，无需配置）
# 浏览器会自动处理语音识别，支持Chrome、Edge、Safari等现代浏览器

# 阿里通义千问API
QWEN_API_KEY=your_qwen_api_key
```

### H2数据库优势
- **零配置**: 无需安装和配置数据库服务器
- **内存模式**: 启动快速，适合开发和测试
- **轻量级**: 适合小型应用和演示
- **Docker友好**: 单容器部署，简化部署流程
- **自动初始化**: 支持SQL脚本自动执行

## 📊 数据库设计

### 主要表结构
- `users`: 用户信息表
- `travel_plans`: 旅游计划表
- `conversations`: 对话记录表

详细数据库设计请参考 [数据库设计文档](数据库设计文档.md)

## 🧪 测试

### 运行测试
```bash
# 后端测试
cd backend
mvn test

# 前端测试
cd frontend
npm test
```

## 📦 部署

### Docker部署（推荐）
```bash
# 一键构建和启动
build-docker.bat  # Windows
# 或
./build-docker.sh  # Linux/Mac

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f travel-planner
```

### 生产环境配置
1. 修改 `docker-compose.yml` 中的环境变量
2. 配置SSL证书（如需要）
3. 设置域名和DNS
4. 配置监控和日志

### 数据管理
```bash
# H2数据库是内存数据库，重启后数据会重置
# 如需持久化数据，可以：
# 1. 修改application.yml使用文件模式
# 2. 定期导出数据到SQL文件
# 3. 使用数据库迁移工具

# 导出数据（开发环境）
# 访问 http://localhost:8080/api/h2-console
# 用户名: sa, 密码: (空)
# 执行SQL导出数据
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目链接: [https://github.com/yourusername/TravelPlanner](https://github.com/yourusername/TravelPlanner)
- 问题反馈: [Issues](https://github.com/yourusername/TravelPlanner/issues)

## 🙏 致谢

- Spring Boot 团队
- React 团队
- Ant Design 团队
- 阿里通义千问
- 百度地图