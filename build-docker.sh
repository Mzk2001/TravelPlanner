#!/bin/bash

# 构建Docker镜像脚本
echo "开始构建TravelPlanner Docker镜像..."

# 进入后端目录
cd backend

# 清理之前的构建
echo "清理之前的构建..."
mvn clean

# 编译和打包
echo "编译和打包应用..."
mvn compile package -DskipTests

# 复制依赖
echo "复制Maven依赖..."
mvn dependency:copy-dependencies -DoutputDirectory=target/dependency

# 返回根目录
cd ..

# 构建Docker镜像
echo "构建Docker镜像..."
docker build -t travel-planner:latest ./backend

echo "Docker镜像构建完成！"
echo "使用以下命令启动应用："
echo "docker-compose up -d"

