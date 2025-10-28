# Docker环境配置说明

## 问题分析

直接运行 `mvn spring-boot:run` 和 `npm start` 能正常工作，但Docker环境下AI对话失败的原因：

### 1. 环境变量配置差异
- **直接运行**：使用本地环境变量或配置文件中的默认值
- **Docker运行**：容器内环境变量未正确设置，导致API Key为空

### 2. 网络连接问题
- Docker容器可能无法访问外部API（通义千问API）
- 需要确保容器有网络访问权限

### 3. 配置文件差异
- `application.yml` 中 `qwen.api-key` 默认值为空
- Docker容器启动时未设置相应的环境变量

## 解决方案

### 1. 设置环境变量

创建 `.env` 文件（可选）：
```bash
# 复制并修改环境变量
QWEN_API_KEY=your_actual_qwen_api_key_here
JWT_SECRET=your_jwt_secret_here
```

### 2. 使用Docker Compose运行

```bash
# 停止现有服务
docker-compose down

# 重新构建并启动
docker-compose up --build

# 或者后台运行
docker-compose up --build -d
```

### 3. 检查服务状态

```bash
# 查看服务日志
docker-compose logs backend

# 查看服务状态
docker-compose ps

# 测试健康检查
curl http://localhost:8080/api/health
```

### 4. 验证AI服务配置

查看后端日志中的AI服务初始化信息：
```
AI服务初始化开始
通义千问API Key配置状态: 已配置/未配置
科大讯飞API Key配置状态: 已配置/未配置
桩程序模式: 启用/禁用
```

## 故障排除

### 如果AI对话仍然失败：

1. **检查API Key配置**：
   - 确保设置了正确的 `QWEN_API_KEY` 环境变量
   - 检查API Key是否有效（不是演示用的假Key）

2. **检查网络连接**：
   ```bash
   # 在容器内测试网络连接
   docker-compose exec backend curl -I https://dashscope.aliyuncs.com
   ```

3. **查看详细日志**：
   ```bash
   docker-compose logs -f backend
   ```

4. **检查用户API Key**：
   - 确保用户在个人设置中配置了有效的通义千问API Key
   - 不是以 `sk-test-` 或 `sk-demo-` 开头的演示Key

### 常见错误信息：

- `网络连接失败`：检查Docker网络配置和防火墙设置
- `API Key无效`：检查通义千问API Key是否正确
- `API访问被拒绝`：检查API Key权限和配额

## 配置示例

### 环境变量方式：
```bash
export QWEN_API_KEY="sk-your-actual-api-key"
docker-compose up --build
```

### .env文件方式：
```bash
# .env文件内容
QWEN_API_KEY=sk-your-actual-api-key
JWT_SECRET=your-secret-key
```

### Docker Compose环境变量：
```yaml
environment:
  - QWEN_API_KEY=${QWEN_API_KEY:-your_qwen_api_key}
```
