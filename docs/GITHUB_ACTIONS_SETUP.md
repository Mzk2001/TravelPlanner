# GitHub Actions Docker 部署指南

本项目配置了自动化的Docker镜像构建和推送到阿里云镜像仓库的GitHub Actions工作流。

## 🚀 工作流说明

### 1. 自动构建和推送 (`docker-build-and-push.yml`)
- **触发条件**: 推送到 `main` 或 `develop` 分支，或创建PR
- **功能**: 自动构建前后端Docker镜像并推送到阿里云镜像仓库
- **标签策略**: 基于分支名和语义版本自动生成标签

### 2. 手动构建 (`manual-docker-build.yml`)
- **触发条件**: 手动触发 (workflow_dispatch)
- **功能**: 允许手动指定标签构建和推送镜像
- **用途**: 用于测试或特殊版本的构建

### 3. 生产发布 (`production-release.yml`)
- **触发条件**: 推送版本标签 (如 `v1.0.0`)
- **功能**: 构建生产版本镜像并创建GitHub Release
- **标签策略**: 同时创建版本标签、主版本标签和latest标签

## ⚙️ 配置步骤

### 1. 设置GitHub Secrets

在GitHub仓库的 Settings → Secrets and variables → Actions 中添加以下secrets：

```
ALIYUN_USERNAME=你的阿里云镜像仓库用户名
ALIYUN_PASSWORD=你的阿里云镜像仓库密码
```

### 2. 修改工作流配置

编辑 `.github/workflows/` 目录下的YAML文件，修改以下配置：

```yaml
env:
  ALIYUN_REGISTRY: crpi-1ukso6d3q7pa1s41.cn-hangzhou.personal.cr.aliyuncs.com  # 你的阿里云镜像仓库地址
  ALIYUN_NAMESPACE: 522025320121_ai4se  # 你的阿里云镜像仓库命名空间
```

### 3. 阿里云镜像仓库配置

1. 登录阿里云控制台
2. 进入容器镜像服务 (ACR)
3. 创建命名空间 (如果还没有)
4. 获取登录凭据

## 📦 镜像标签策略

### 自动构建标签
- `main` 分支: `latest`
- `develop` 分支: `develop`
- PR: `pr-{number}`

### 生产发布标签
- 版本标签: `v1.0.0`
- 主版本: `v1`
- 最新版本: `latest`

## 🐳 使用构建的镜像

### 拉取镜像
```bash
# 拉取最新版本
docker pull crpi-1ukso6d3q7pa1s41.cn-hangzhou.personal.cr.aliyuncs.com/522025320121_ai4se/travel-planner-backend:latest
docker pull crpi-1ukso6d3q7pa1s41.cn-hangzhou.personal.cr.aliyuncs.com/522025320121_ai4se/travel-planner-frontend:latest

# 拉取特定版本
docker pull crpi-1ukso6d3q7pa1s41.cn-hangzhou.personal.cr.aliyuncs.com/522025320121_ai4se/travel-planner-backend:v1.0.0
docker pull crpi-1ukso6d3q7pa1s41.cn-hangzhou.personal.cr.aliyuncs.com/522025320121_ai4se/travel-planner-frontend:v1.0.0
```

### 使用Docker Compose
```yaml
version: '3.8'

services:
  backend:
    image: crpi-1ukso6d3q7pa1s41.cn-hangzhou.personal.cr.aliyuncs.com/522025320121_ai4se/travel-planner-backend:latest
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=default
      - JWT_SECRET=your-jwt-secret
      - QWEN_API_KEY=your-qwen-api-key
    restart: unless-stopped

  frontend:
    image: crpi-1ukso6d3q7pa1s41.cn-hangzhou.personal.cr.aliyuncs.com/522025320121_ai4se/travel-planner-frontend:latest
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
```

## 🔧 手动触发构建

1. 进入GitHub仓库的Actions页面
2. 选择 "Manual Docker Build and Push" 工作流
3. 点击 "Run workflow"
4. 输入标签名称 (如 `v1.0.0`)
5. 选择是否推送到镜像仓库
6. 点击 "Run workflow"

## 📋 发布新版本

1. 确保代码已合并到main分支
2. 创建并推送版本标签：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions会自动：
   - 构建Docker镜像
   - 推送到阿里云镜像仓库
   - 创建GitHub Release

## 🔍 监控和调试

### 查看构建日志
1. 进入GitHub仓库的Actions页面
2. 点击相应的工作流运行
3. 查看详细的构建日志

### 常见问题
1. **认证失败**: 检查GitHub Secrets中的阿里云凭据
2. **构建失败**: 检查Dockerfile和构建上下文
3. **推送失败**: 确认阿里云镜像仓库权限

## 📚 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Docker Buildx 文档](https://docs.docker.com/buildx/)
- [阿里云容器镜像服务](https://www.aliyun.com/product/acr)
