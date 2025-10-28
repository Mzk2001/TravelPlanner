# 使用Eclipse Temurin 8 作为基础镜像（支持多平台）
FROM eclipse-temurin:8-jdk

# 设置工作目录
WORKDIR /app

# 安装必要的工具和SSL证书
RUN apt-get update && \
    apt-get install -y curl ca-certificates && \
    update-ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 创建应用目录（如需要持久化，可在 docker-compose 中挂载卷）
RUN mkdir -p /app/data

# 复制JAR文件和安全配置
COPY target/travel-planner-1.0.0.jar app.jar
COPY java.security java.security

# 暴露端口
EXPOSE 8080

# 设置JVM参数和SSL配置（Java 8优化）
ENV JAVA_OPTS="-Xmx512m -Xms256m -Djava.security.egd=file:/dev/./urandom \
    -Djavax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts \
    -Djavax.net.ssl.trustStorePassword=changeit \
    -Dhttps.protocols=TLSv1.2 \
    -Djdk.tls.client.protocols=TLSv1.2 \
    -Djdk.tls.server.protocols=TLSv1.2 \
    -Dcom.sun.net.ssl.checkRevocation=false \
    -Dtrust_all_cert=true \
    -Djava.net.useSystemProxies=false \
    -Dhttps.cipherSuites=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384,TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256,TLS_RSA_WITH_AES_256_GCM_SHA384,TLS_RSA_WITH_AES_128_GCM_SHA256 \
    -Djava.security.properties=/app/java.security"

# 设置JWT密钥环境变量（使用ARG而不是ENV避免安全警告）
ARG JWT_SECRET="travelplanner-secret-key-2024-very-secure-jwt-token-for-hs512-algorithm-must-be-at-least-512-bits-long"
ENV JWT_SECRET=$JWT_SECRET

# 启动应用程序
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
