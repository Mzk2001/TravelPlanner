# 使用OpenJDK 17作为基础镜像
FROM openjdk:17-jdk-slim

# 设置工作目录
WORKDIR /app

# 复制Maven包装器和pom.xml
COPY backend/mvnw .
COPY backend/.mvn .mvn
COPY backend/pom.xml .

# 复制源代码
COPY backend/src src

# 构建应用
RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests

# 暴露端口
EXPOSE 8080

# 设置环境变量
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# 启动应用
CMD ["sh", "-c", "java $JAVA_OPTS -jar target/travel-planner-1.0.0.jar"]
