@echo off
echo 开始构建TravelPlanner Docker镜像...

REM 进入后端目录
cd backend

REM 清理之前的构建
echo 清理之前的构建...
mvn clean

REM 编译和打包
echo 编译和打包应用...
mvn compile package -DskipTests

REM 复制依赖
echo 复制Maven依赖...
mvn dependency:copy-dependencies -DoutputDirectory=target/dependency

REM 返回根目录
cd ..

REM 构建Docker镜像
echo 构建Docker镜像...
docker build -t travel-planner:latest ./backend

echo Docker镜像构建完成！
echo 使用以下命令启动应用：
echo docker-compose up -d

