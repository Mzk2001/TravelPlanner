# TravelPlanner - 智能旅游助手

基于大语言模型的智能旅游规划Web应用，集成阿里通义千问、科大讯飞和高德地图服务。

## 🏗️ 项目架构

```
TravelPlanner/
├── backend/                 # Spring Boot后端服务
│   ├── src/                # Java源代码
│   │   ├── main/java/com/travelplanner/
│   │   │   ├── entity/     # 实体类
│   │   │   ├── repository/ # 数据访问层
│   │   │   ├── service/    # 业务逻辑层
│   │   │   └── controller/ # 控制器层
│   │   └── resources/       # 配置文件
│   ├── pom.xml             # Maven配置
│   └── Dockerfile          # 后端Docker配置
├── frontend/               # React前端应用
│   ├── src/                # React源代码
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   ├── types/          # TypeScript类型
│   │   └── utils/          # 工具函数
│   ├── package.json        # Node.js依赖
│   ├── Dockerfile          # 前端Docker配置
│   └── nginx.conf          # Nginx配置
├── docker-compose.yml      # 服务编排
├── init.sql               # 数据库初始化
└── .env                   # 环境变量配置
```

## 🚀 技术栈

### 后端技术
- **框架**: Spring Boot 2.7.18
- **语言**: Java 8
- **数据库**: SQLite (内嵌数据库)
- **ORM**: Spring Data JPA
- **安全**: Spring Security + JWT
- **构建**: Maven

### 前端技术
- **框架**: React 18 + TypeScript
- **构建**: Vite
- **UI库**: Ant Design
- **路由**: React Router
- **HTTP**: Axios
- **状态**: React Hooks

### 基础设施
- **容器化**: Docker + Docker Compose
- **数据库**: SQLite (无需外部数据库)
- **部署**: 单容器部署，数据持久化

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
- 集成科大讯飞语音服务
- 语音输入识别
- 语音回复生成

### 5. 地图服务
- 集成高德地图API
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
- **测试用户**: username: `test`, password: `password`

### 5. 查看日志
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

# 编译运行（使用SQLite数据库）
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
- **SQLite数据库**: 数据文件存储在 `backend/data/travel_planner.db`
- **数据持久化**: 通过Docker volume挂载实现数据持久化
- **无需外部数据库**: 应用内置SQLite，无需安装PostgreSQL等数据库

### API测试
```bash
# 用户注册
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
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

# 高德地图API
AMAP_API_KEY=your_amap_api_key

# 科大讯飞API
XUNFEI_APP_ID=your_xunfei_app_id
XUNFEI_API_KEY=your_xunfei_api_key
XUNFEI_API_SECRET=your_xunfei_api_secret

# 阿里通义千问API
QWEN_API_KEY=your_qwen_api_key
```

### SQLite数据库优势
- **零配置**: 无需安装和配置数据库服务器
- **便携性**: 数据库文件可随应用一起分发
- **轻量级**: 适合小型应用和演示
- **Docker友好**: 单容器部署，简化部署流程

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

### 数据备份
```bash
# 备份SQLite数据库
cp backend/data/travel_planner.db backup/travel_planner_$(date +%Y%m%d).db

# 恢复数据库
cp backup/travel_planner_20240101.db backend/data/travel_planner.db
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
- 科大讯飞
- 高德地图