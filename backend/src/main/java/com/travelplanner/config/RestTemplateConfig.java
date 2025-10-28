package com.travelplanner.config;

import org.apache.http.client.HttpClient;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.TrustSelfSignedStrategy;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.ssl.SSLContextBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.SSLContext;
import java.nio.charset.StandardCharsets;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.util.List;

/**
 * RestTemplate配置类
 * 确保HTTP客户端使用UTF-8编码
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@Configuration
public class RestTemplateConfig {

    /**
     * 配置RestTemplate，确保使用UTF-8编码
     */
    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        
        // 设置字符编码为UTF-8
        List<HttpMessageConverter<?>> converters = restTemplate.getMessageConverters();
        for (HttpMessageConverter<?> converter : converters) {
            if (converter instanceof StringHttpMessageConverter) {
                ((StringHttpMessageConverter) converter).setDefaultCharset(StandardCharsets.UTF_8);
            }
        }
        
        // 设置请求工厂
        restTemplate.setRequestFactory(clientHttpRequestFactory());
        
        return restTemplate;
    }

    /**
     * 配置HTTP请求工厂，支持SSL连接
     */
    @Bean
    public ClientHttpRequestFactory clientHttpRequestFactory() {
        try {
            // 创建SSL上下文，信任所有证书（用于开发环境）
            SSLContext sslContext = SSLContextBuilder.create()
                    .loadTrustMaterial(null, new TrustSelfSignedStrategy())
                    .build();
            
            // 创建SSL连接套接字工厂
            SSLConnectionSocketFactory sslConnectionSocketFactory = new SSLConnectionSocketFactory(
                    sslContext,
                    new String[]{"TLSv1.2", "TLSv1.3"},
                    null,
                    SSLConnectionSocketFactory.getDefaultHostnameVerifier()
            );
            
            // 创建HTTP客户端
            HttpClient httpClient = HttpClients.custom()
                    .setSSLSocketFactory(sslConnectionSocketFactory)
                    .build();
            
            // 创建HTTP组件客户端请求工厂
            HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);
            factory.setConnectTimeout(30000); // 30秒连接超时
            factory.setReadTimeout(60000);    // 60秒读取超时
            
            return factory;
            
        } catch (NoSuchAlgorithmException | KeyManagementException | KeyStoreException e) {
            // 如果SSL配置失败，回退到简单的HTTP工厂
            org.springframework.http.client.SimpleClientHttpRequestFactory fallbackFactory = 
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
            fallbackFactory.setConnectTimeout(30000);
            fallbackFactory.setReadTimeout(60000);
            return fallbackFactory;
        }
    }
}
