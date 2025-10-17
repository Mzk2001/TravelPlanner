# TravelPlanner 开发环境启动指南

## 项目结构

```
TravelPlanner/
├── backend/                 # Spring Boot后端
│   ├── src/                # Java源代码
│   ├── pom.xml             # Maven配置
│   └── target/             # 编译输出
├── frontend/               # React前端
│   ├── src/                # React源代码
│   ├── public/             # 静态资源
│   ├── package.json        # Node.js依赖
│   ├── Dockerfile          # 前端Docker配置
│   └── nginx.conf          # Nginx配置
├── docker-compose.yml      # 服务编排
├── Dockerfile              # 后端Docker配置
├── init.sql               # 数据库初始化
└── .env                   # 环境变量配置
```

## 环境要求

- Java 17+
- Maven 3.6+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+

## 快速启动

### 1. 使用Docker Compose（推荐）

```bash
# 1. 复制环境变量配置文件
cp env.example .env

# 2. 编辑 .env 文件，填入真实的API密钥
# AMAP_API_KEY=your_real_amap_api_key
# XUNFEI_APP_ID=your_real_xunfei_app_id
# XUNFEI_API_KEY=your_real_xunfei_api_key
# XUNFEI_API_SECRET=your_real_xunfei_api_secret
# QWEN_API_KEY=your_real_qwen_api_key

# 3. 启动所有服务
docker-compose up -d

# 4. 查看服务状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 2. 本地开发模式

#### 后端开发
```bash
# 1. 启动PostgreSQL数据库
docker-compose up -d postgres

# 2. 进入后端目录
cd backend

# 3. 编译项目
mvn clean compile

# 4. 运行应用
mvn spring-boot:run
```

#### 前端开发
```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

## 服务访问

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8080/api
- **数据库**: localhost:5432
- **数据库管理**: 可使用pgAdmin或DBeaver连接

## API测试

### 用户注册
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
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
- **框架**: Spring Boot 3.2.0
- **Java版本**: Java 17
- **数据库**: PostgreSQL 15
- **ORM**: Spring Data JPA
- **安全**: Spring Security + JWT
- **构建工具**: Maven

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI库**: Ant Design
- **路由**: React Router
- **HTTP客户端**: Axios
- **状态管理**: React Hooks

### 主要功能模块
1. **用户管理**: 注册、登录、用户信息管理
2. **旅游计划**: 创建、查询、更新、删除旅游计划
3. **对话记录**: 保存用户与AI的对话历史
4. **AI集成**: 集成阿里通义千问、科大讯飞、高德地图

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查PostgreSQL是否正常启动
   - 确认数据库连接参数正确

2. **API密钥错误**
   - 检查.env文件中的API密钥是否正确
   - 确认API密钥有足够的权限

3. **端口冲突**
   - 检查8080和3000端口是否被占用
   - 可以修改配置文件中的端口设置

4. **前端无法连接后端**
   - 检查后端服务是否正常启动
   - 确认API代理配置正确

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
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
1. 修改 `init.sql` 文件进行数据库结构变更
2. 使用 `docker-compose restart postgres` 重启数据库
3. 或者使用数据库管理工具直接操作

## 下一步开发

1. **完善AI服务集成** - 实现阿里通义千问、科大讯飞、高德地图的集成
2. **添加安全认证** - 完善JWT认证和权限控制
3. **前端功能完善** - 添加更多交互功能和优化用户体验
4. **测试用例** - 编写单元测试和集成测试
5. **部署优化** - 完善CI/CD流程和生产环境配置
