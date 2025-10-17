# 本地开发快速启动指南 (无Docker版本)

## 1. 环境准备

### 必需软件
- Java 17+
- Maven 3.8+
- PostgreSQL 15+
- Node.js 18+

### 可选软件
- pgAdmin (PostgreSQL管理工具)
- IntelliJ IDEA / VS Code

## 2. 数据库设置

### 安装PostgreSQL
```bash
# Windows (使用Chocolatey)
choco install postgresql

# 或下载安装包
# https://www.postgresql.org/download/windows/
```

### 创建数据库
```sql
-- 1. 连接到PostgreSQL
psql -U postgres

-- 2. 创建数据库和用户
CREATE DATABASE travel_planner;
CREATE USER travelplanner WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE travel_planner TO travelplanner;

-- 3. 退出
\q
```

### 执行初始化脚本
```bash
# 执行建表脚本
psql -U travelplanner -d travel_planner -f init.sql
```

## 3. 后端启动

### 配置环境变量
```bash
# 复制环境变量文件
cp env.example .env

# 编辑.env文件，填入真实密码
# DB_PASSWORD=your_real_password
```

### 启动后端服务
```bash
cd backend
mvn spring-boot:run
```

## 4. 前端启动

```bash
cd frontend
npm install
npm run dev
```

## 5. 访问应用

- 后端API: http://localhost:8080/api
- 前端界面: http://localhost:3000
- 数据库管理: http://localhost:8080/api/h2-console (H2模式)

## 6. 常见问题

### 数据库连接失败
- 检查PostgreSQL服务是否启动
- 验证用户名密码是否正确
- 确认数据库是否存在

### 端口冲突
- 后端默认8080端口
- 前端默认3000端口
- 数据库默认5432端口

### 依赖问题
- 清理Maven缓存: `mvn clean`
- 重新安装依赖: `mvn install`
- 检查Java版本: `java -version`


