# TravelPlanner 开发环境启动指南

## 项目结构

```
TravelPlanner/
├── backend/                 # Spring Boot后端
│   ├── src/                # Java源代码
│   ├── pom.xml             # Maven配置
│   ├── Dockerfile          # Docker配置
│   └── data/               # H2数据库文件目录
├── frontend/               # React前端
│   ├── src/                # React源代码
│   ├── public/             # 静态资源
│   ├── package.json        # Node.js依赖
│   ├── Dockerfile          # Docker配置
│   └── nginx.conf          # Nginx配置
├── docker-compose.yml      # 服务编排
├── build-docker.bat        # Windows构建脚本
├── build-docker.sh         # Linux/Mac构建脚本
└── env.example             # 环境变量示例
```

## 环境要求

- Java 8+
- Maven 3.6+
- Node.js 18+
- Docker & Docker Compose
- H2数据库（内嵌，无需安装）

## 快速启动

### 1. 使用Docker Compose（推荐）

```bash
# 1. 复制环境变量配置文件
cp env.example .env

# 2. 编辑 .env 文件，填入真实的API密钥
# BAIDU_API_KEY=your_real_baidu_api_key
# XUNFEI_APP_ID=your_real_xunfei_app_id
# XUNFEI_API_KEY=your_real_xunfei_api_key
# XUNFEI_API_SECRET=your_real_xunfei_api_secret
# QWEN_API_KEY=your_real_qwen_api_key

# 3. 启动所有服务
docker-compose up -d

# 4. 查看服务状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f travel-planner
```

### 2. 本地开发模式

#### 后端开发
```bash
# 1. 进入后端目录
cd backend

# 2. 编译项目
mvn clean compile

# 3. 运行应用（使用H2内存数据库）
mvn spring-boot:run
```

#### 前端开发
```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm start
```

## 服务访问

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8080/api
- **H2控制台**: http://localhost:8080/api/h2-console (用户名: sa, 密码: 空)

## API测试

### 用户注册
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",  // 演示用密码，生产环境请使用强密码
    "email": "test@example.com"
  }'
```

### 创建旅游计划
```bash
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

## 开发说明

### 后端技术栈
- **框架**: Spring Boot 2.7.18
- **Java版本**: Java 8
- **数据库**: H2 (内存数据库)
- **ORM**: Spring Data JPA
- **安全**: Spring Security + JWT
- **构建工具**: Maven
- **HTTP客户端**: WebFlux

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Create React App
- **UI库**: Ant Design + Material-UI
- **路由**: React Router
- **HTTP客户端**: Axios
- **状态管理**: React Hooks + Context
- **图表**: Recharts

### 主要功能模块
1. **用户管理**: 注册、登录、用户信息管理
2. **旅游计划**: 创建、查询、更新、删除旅游计划
3. **对话记录**: 保存用户与AI的对话历史
4. **AI集成**: 集成阿里通义千问、科大讯飞、百度地图

## 故障排除

### 常见问题

1. **端口冲突**
   - 检查8080端口是否被占用
   - 可以修改docker-compose.yml中的端口映射
   - 或者停止占用端口的服务

2. **API密钥错误**
   - 检查.env文件中的API密钥是否正确
   - 确认API密钥有足够的权限

3. **H2数据库问题**
   - H2是内存数据库，重启后数据会重置
   - 如需持久化，可修改application.yml使用文件模式

4. **前端无法连接后端**
   - 检查后端服务是否正常启动
   - 确认API代理配置正确

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f travel-planner
```

## 开发工作流

### 后端开发
1. 修改 `backend/src` 目录下的Java代码
2. 使用 `mvn spring-boot:run` 启动开发服务器
3. 代码会自动热重载

### 前端开发
1. 修改 `frontend/src` 目录下的React代码
2. 使用 `npm run dev` 启动开发服务器
3. 支持热重载和快速刷新

### 数据库操作
1. H2数据库是内存数据库，重启后数据会重置
2. 可通过H2控制台查看和管理数据
3. 如需持久化，修改application.yml使用文件模式

## 下一步开发

1. **完善AI服务集成** - 实现阿里通义千问、科大讯飞、百度地图的集成
2. **添加安全认证** - 完善JWT认证和权限控制
3. **前端功能完善** - 添加更多交互功能和优化用户体验
4. **测试用例** - 编写单元测试和集成测试
5. **部署优化** - 完善CI/CD流程和生产环境配置
