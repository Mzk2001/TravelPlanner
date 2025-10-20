# 使用Eclipse Temurin 8 Alpine作为基础镜像
FROM eclipse-temurin:8-jdk-alpine

# 设置工作目录
WORKDIR /app

# 安装必要的工具
RUN apk add --no-cache curl

# 创建应用目录（如需要持久化，可在 docker-compose 中挂载卷）
RUN mkdir -p /app/data

# 复制Maven依赖
COPY target/dependency/ /app/lib/

# 复制应用程序类文件
COPY target/classes/ /app/classes/

# 设置类路径（包含依赖与编译输出）
ENV CLASSPATH=/app/classes:/app/lib/*

# 暴露端口
EXPOSE 8080

# 设置JVM参数
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# 启动应用程序
CMD ["sh", "-c", "java $JAVA_OPTS -cp $CLASSPATH com.travelplanner.TravelPlannerApplication"]
