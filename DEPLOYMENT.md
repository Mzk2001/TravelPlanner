# TravelPlanner SQLite部署指南

## 🎯 项目改造总结

本项目已从PostgreSQL/H2数据库改造为SQLite内嵌数据库，实现单容器部署，助教检查作业时只需Docker镜像即可。

## 📋 主要更改

### 1. 数据库配置更改
- **pom.xml**: 移除H2依赖，添加SQLite依赖
- **application.yml**: 配置SQLite数据库连接
- **data.sql**: 适配SQLite语法

### 2. Docker配置
- **Dockerfile**: 创建支持SQLite的Docker镜像
- **docker-compose.yml**: 单容器部署配置
- **构建脚本**: 提供一键构建脚本

### 3. 文档更新
- **README.md**: 更新部署说明
- **DEPLOYMENT.md**: 详细部署指南

## 🚀 快速部署

### 环境要求
- Docker & Docker Compose
- 无需安装Java、Maven、Node.js或数据库

### 一键部署
```bash
# Windows用户
build-docker.bat

# Linux/Mac用户
chmod +x build-docker.sh
./build-docker.sh

# 启动应用
docker-compose up -d
```

### 手动部署
```bash
# 1. 进入后端目录
cd backend

# 2. 编译项目
mvn clean compile package -DskipTests

# 3. 复制依赖
mvn dependency:copy-dependencies -DoutputDirectory=target/dependency

# 4. 返回根目录
cd ..

# 5. 构建Docker镜像
docker build -t travel-planner:latest ./backend

# 6. 启动应用
docker-compose up -d
```

## 🔧 配置说明

### SQLite数据库
- **数据库文件**: `backend/data/travel_planner.db`
- **数据持久化**: 通过Docker volume挂载
- **初始化数据**: 自动创建测试用户

### 测试用户
- **用户名**: `test`
- **密码**: `password`
- **角色**: `USER`

### API端点
- **健康检查**: `http://localhost:8080/api/health`
- **用户登录**: `http://localhost:8080/api/auth/login`
- **用户注册**: `http://localhost:8080/api/users/register`

## 📊 数据库结构

### 主要表
- `users`: 用户信息表
- `travel_plans`: 旅游计划表
- `conversations`: 对话记录表

### 数据持久化
- SQLite数据库文件存储在Docker volume中
- 容器重启后数据不会丢失
- 支持数据备份和恢复

## 🛠️ 开发说明

### 本地开发
```bash
# 后端开发
cd backend
mvn spring-boot:run

# 前端开发
cd frontend
npm install
npm run dev
```

### 数据库管理
```bash
# 查看数据库文件
ls backend/data/

# 备份数据库
cp backend/data/travel_planner.db backup/

# 恢复数据库
cp backup/travel_planner.db backend/data/
```

## 🐛 故障排除

### 常见问题
1. **Docker构建失败**: 检查Maven依赖是否正确下载
2. **数据库连接失败**: 检查SQLite文件权限
3. **应用启动失败**: 查看Docker日志

### 日志查看
```bash
# 查看应用日志
docker-compose logs -f travel-planner

# 查看服务状态
docker-compose ps
```

## 📦 部署优势

### SQLite优势
- **零配置**: 无需安装数据库服务器
- **便携性**: 数据库文件可随应用分发
- **轻量级**: 适合小型应用和演示
- **Docker友好**: 单容器部署

### 助教检查便利性
- **一键部署**: 只需Docker和Docker Compose
- **无外部依赖**: 不需要安装数据库
- **数据持久化**: 重启后数据不丢失
- **完整功能**: 包含所有业务功能

## 🔄 版本控制

### 文件更改清单
- `backend/pom.xml` - 添加SQLite依赖
- `backend/src/main/resources/application.yml` - SQLite配置
- `backend/src/main/resources/data.sql` - SQLite语法适配
- `backend/Dockerfile` - Docker镜像配置
- `docker-compose.yml` - 服务编排
- `build-docker.sh` - Linux/Mac构建脚本
- `build-docker.bat` - Windows构建脚本
- `README.md` - 文档更新
- `DEPLOYMENT.md` - 部署指南

## 📞 技术支持

如有问题，请检查：
1. Docker和Docker Compose是否正常安装
2. 端口8080是否被占用
3. 防火墙设置是否正确
4. 查看应用日志获取详细错误信息

