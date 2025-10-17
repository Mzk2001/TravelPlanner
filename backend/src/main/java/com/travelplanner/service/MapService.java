package com.travelplanner.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * 地图服务类 - 集成高德地图API
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MapService {
    
    private final RestTemplate restTemplate;
    
    @Value("${app.amap.api-key:}")
    private String amapApiKey;
    
    @Value("${app.amap.base-url:https://restapi.amap.com/v3}")
    private String amapBaseUrl;
    
    /**
     * 搜索地点
     * 
     * @param keyword 搜索关键词
     * @param city 城市（可选）
     * @return 地点搜索结果
     */
    public Map<String, Object> searchPlace(String keyword, String city) {
        try {
            log.info("搜索地点: keyword={}, city={}", keyword, city);
            
            String url = amapBaseUrl + "/place/text";
            
            Map<String, String> params = new HashMap<>();
            params.put("key", amapApiKey);
            params.put("keywords", keyword);
            params.put("output", "json");
            params.put("offset", "20");
            params.put("page", "1");
            params.put("extensions", "all");
            
            if (city != null && !city.isEmpty()) {
                params.put("city", city);
            }
            
            StringBuilder urlBuilder = new StringBuilder(url);
            urlBuilder.append("?");
            params.forEach((key, value) -> {
                urlBuilder.append(key).append("=").append(value).append("&");
            });
            
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.getForEntity(urlBuilder.toString(), (Class<Map<String, Object>>) (Class<?>) Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                log.info("地点搜索成功");
                return result;
            }
            
            return createErrorResponse("搜索失败");
            
        } catch (Exception e) {
            log.error("地点搜索失败: {}", e.getMessage());
            return createErrorResponse("搜索服务暂时不可用");
        }
    }
    
    /**
     * 获取地点详情
     * 
     * @param placeId 地点ID
     * @return 地点详情
     */
    public Map<String, Object> getPlaceDetail(String placeId) {
        try {
            log.info("获取地点详情: placeId={}", placeId);
            
            String url = amapBaseUrl + "/place/detail";
            
            Map<String, String> params = new HashMap<>();
            params.put("key", amapApiKey);
            params.put("id", placeId);
            params.put("output", "json");
            params.put("extensions", "all");
            
            StringBuilder urlBuilder = new StringBuilder(url);
            urlBuilder.append("?");
            params.forEach((key, value) -> {
                urlBuilder.append(key).append("=").append(value).append("&");
            });
            
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.getForEntity(urlBuilder.toString(), (Class<Map<String, Object>>) (Class<?>) Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                log.info("地点详情获取成功");
                return result;
            }
            
            return createErrorResponse("获取详情失败");
            
        } catch (Exception e) {
            log.error("获取地点详情失败: {}", e.getMessage());
            return createErrorResponse("详情服务暂时不可用");
        }
    }
    
    /**
     * 计算两点间距离
     * 
     * @param origin 起点坐标 (经度,纬度)
     * @param destination 终点坐标 (经度,纬度)
     * @return 距离信息
     */
    public Map<String, Object> calculateDistance(String origin, String destination) {
        try {
            log.info("计算距离: origin={}, destination={}", origin, destination);
            
            String url = amapBaseUrl + "/distance";
            
            Map<String, String> params = new HashMap<>();
            params.put("key", amapApiKey);
            params.put("origins", origin);
            params.put("destinations", destination);
            params.put("output", "json");
            params.put("type", "1"); // 直线距离
            
            StringBuilder urlBuilder = new StringBuilder(url);
            urlBuilder.append("?");
            params.forEach((key, value) -> {
                urlBuilder.append(key).append("=").append(value).append("&");
            });
            
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.getForEntity(urlBuilder.toString(), (Class<Map<String, Object>>) (Class<?>) Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                log.info("距离计算成功");
                return result;
            }
            
            return createErrorResponse("距离计算失败");
            
        } catch (Exception e) {
            log.error("距离计算失败: {}", e.getMessage());
            return createErrorResponse("距离服务暂时不可用");
        }
    }
    
    /**
     * 路径规划
     * 
     * @param origin 起点坐标
     * @param destination 终点坐标
     * @param strategy 路径策略 (1-10)
     * @return 路径规划结果
     */
    public Map<String, Object> planRoute(String origin, String destination, int strategy) {
        try {
            log.info("路径规划: origin={}, destination={}, strategy={}", origin, destination, strategy);
            
            String url = amapBaseUrl + "/direction/driving";
            
            Map<String, String> params = new HashMap<>();
            params.put("key", amapApiKey);
            params.put("origin", origin);
            params.put("destination", destination);
            params.put("strategy", String.valueOf(strategy));
            params.put("output", "json");
            params.put("extensions", "all");
            
            StringBuilder urlBuilder = new StringBuilder(url);
            urlBuilder.append("?");
            params.forEach((key, value) -> {
                urlBuilder.append(key).append("=").append(value).append("&");
            });
            
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.getForEntity(urlBuilder.toString(), (Class<Map<String, Object>>) (Class<?>) Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                log.info("路径规划成功");
                return result;
            }
            
            return createErrorResponse("路径规划失败");
            
        } catch (Exception e) {
            log.error("路径规划失败: {}", e.getMessage());
            return createErrorResponse("路径规划服务暂时不可用");
        }
    }
    
    /**
     * 获取天气信息
     * 
     * @param city 城市名称
     * @return 天气信息
     */
    public Map<String, Object> getWeather(String city) {
        try {
            log.info("获取天气信息: city={}", city);
            
            String url = amapBaseUrl + "/weather/weatherInfo";
            
            Map<String, String> params = new HashMap<>();
            params.put("key", amapApiKey);
            params.put("city", city);
            params.put("output", "json");
            params.put("extensions", "all");
            
            StringBuilder urlBuilder = new StringBuilder(url);
            urlBuilder.append("?");
            params.forEach((key, value) -> {
                urlBuilder.append(key).append("=").append(value).append("&");
            });
            
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.getForEntity(urlBuilder.toString(), (Class<Map<String, Object>>) (Class<?>) Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                log.info("天气信息获取成功");
                return result;
            }
            
            return createErrorResponse("天气信息获取失败");
            
        } catch (Exception e) {
            log.error("获取天气信息失败: {}", e.getMessage());
            return createErrorResponse("天气服务暂时不可用");
        }
    }
    
    /**
     * 创建错误响应
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("status", "0");
        error.put("info", message);
        return error;
    }
}

