package com.travelplanner.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 字符编码配置类
 * 确保所有HTTP请求和响应使用UTF-8编码
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@Configuration
public class EncodingConfig implements WebMvcConfigurer {

    /**
     * 配置HTTP消息转换器，确保使用UTF-8编码
     */
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        StringHttpMessageConverter stringConverter = new StringHttpMessageConverter(StandardCharsets.UTF_8);
        stringConverter.setWriteAcceptCharset(false);
        converters.add(stringConverter);
    }
}
