# TravelPlanner H2部署指南

## 🎯 项目改造总结

本项目使用H2内存数据库，实现单容器部署，助教检查作业时只需Docker镜像即可。

## 📋 主要特性

### 1. 数据库配置
- **H2内存数据库**: 应用启动时自动创建，无需外部数据库
- **零配置**: 无需安装和配置数据库服务器
- **轻量级**: 适合小型应用和演示

### 2. Docker配置
- **单容器部署**: 后端服务包含所有依赖
- **构建脚本**: 提供一键构建脚本
- **健康检查**: 自动检测服务状态

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

### H2数据库
- **数据库类型**: H2内存数据库
- **数据持久化**: 重启后数据会重置（适合演示）
- **初始化数据**: 自动创建测试用户
- **控制台访问**: http://localhost:8080/api/h2-console

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
- `expenses`: 费用记录表

### 数据管理
- H2数据库是内存数据库，重启后数据会重置
- 如需持久化数据，可以修改application.yml使用文件模式
- 支持通过H2控制台查看和管理数据

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

## 🐛 故障排除

### 常见问题
1. **Docker构建失败**: 检查Maven依赖是否正确下载
2. **端口冲突**: 检查8080端口是否被占用
3. **应用启动失败**: 查看Docker日志
4. **H2数据库问题**: 确认H2依赖正确配置

### 日志查看
```bash
# 查看应用日志
docker-compose logs -f travel-planner

# 查看服务状态
docker-compose ps
```

## 📦 部署优势

### H2数据库优势
- **零配置**: 无需安装数据库服务器
- **内存模式**: 启动快速，适合开发和测试
- **轻量级**: 适合小型应用和演示
- **Docker友好**: 单容器部署
- **自动初始化**: 支持SQL脚本自动执行

### 助教检查便利性
- **一键部署**: 只需Docker和Docker Compose
- **无外部依赖**: 不需要安装数据库
- **快速启动**: 内存数据库启动迅速
- **完整功能**: 包含所有业务功能

## 🔄 版本控制

### 文件更改清单
- `backend/pom.xml` - 使用H2数据库依赖
- `backend/src/main/resources/application.yml` - H2数据库配置
- `backend/src/main/resources/data.sql` - 初始化数据
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

