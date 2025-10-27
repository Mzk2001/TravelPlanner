package com.travelplanner.controller;

import com.travelplanner.entity.User;
import com.travelplanner.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;
import com.travelplanner.util.MapUtils;
import java.util.Optional;

/**
 * 用户控制器
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    
    private final UserService userService;
    
    /**
     * 用户注册
     * 
     * @param request 注册请求
     * @return 注册结果
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("用户注册请求: username={}", request.getUsername());
            
            User user = userService.register(
                request.getUsername(),
                request.getPassword(),
                request.getEmail()
            );
            
            // 返回用户信息（不包含密码）
            UserResponse response = new UserResponse();
            response.setId(user.getId());
            response.setUsername(user.getUsername());
            response.setEmail(user.getEmail());
            response.setPhone(user.getPhone());
            response.setFullName(user.getFullName());
            response.setAvatarUrl(user.getAvatarUrl());
            response.setRole(user.getRole());
            response.setIsActive(user.getIsActive());
            response.setCreatedAt(user.getCreatedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("用户注册失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", e.getMessage()));
        }
    }
    
    /**
     * 获取用户信息
     * 
     * @param userId 用户ID
     * @return 用户信息
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUser(@PathVariable Long userId) {
        try {
            Optional<User> user = userService.findById(userId);
            if (user.isPresent()) {
                UserResponse response = new UserResponse();
                response.setId(user.get().getId());
                response.setUsername(user.get().getUsername());
                response.setEmail(user.get().getEmail());
                response.setPhone(user.get().getPhone());
                response.setFullName(user.get().getFullName());
                response.setAvatarUrl(user.get().getAvatarUrl());
                response.setRole(user.get().getRole());
                response.setIsActive(user.get().getIsActive());
                response.setCreatedAt(user.get().getCreatedAt());
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("获取用户信息失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", e.getMessage()));
        }
    }
    
    /**
     * 更新用户信息
     * 
     * @param userId 用户ID
     * @param request 更新请求
     * @return 更新结果
     */
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, 
                                      @Valid @RequestBody UpdateUserRequest request) {
        try {
            log.info("更新用户信息: userId={}", userId);
            
            Optional<User> userOpt = userService.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setFullName(request.getFullName());
            user.setAvatarUrl(request.getAvatarUrl());
            
            User updatedUser = userService.updateUser(user);
            
            UserResponse response = new UserResponse();
            response.setId(updatedUser.getId());
            response.setUsername(updatedUser.getUsername());
            response.setEmail(updatedUser.getEmail());
            response.setPhone(updatedUser.getPhone());
            response.setFullName(updatedUser.getFullName());
            response.setAvatarUrl(updatedUser.getAvatarUrl());
            response.setRole(updatedUser.getRole());
            response.setIsActive(updatedUser.getIsActive());
            response.setCreatedAt(updatedUser.getCreatedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("更新用户信息失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", e.getMessage()));
        }
    }
    
    // 内部类：请求和响应DTO
    public static class RegisterRequest {
        private String username;
        private String password;
        private String email;
        
        // Getters and Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    
    public static class UpdateUserRequest {
        private String email;
        private String phone;
        private String fullName;
        private String avatarUrl;
        
        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }
    
    /**
     * 保存用户的通义千问API Key
     * 
     * @param userId 用户ID
     * @param request API Key请求
     * @return 保存结果
     */
    @PostMapping("/{userId}/api-key")
    public ResponseEntity<?> saveApiKey(@PathVariable Long userId, @RequestBody ApiKeyRequest request) {
        try {
            log.info("保存用户API Key请求: userId={}", userId);
            
            if (request.getApiKey() == null || request.getApiKey().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(MapUtils.createResponseMap(false, "API Key不能为空"));
            }
            
            userService.saveQwenApiKey(userId, request.getApiKey());
            
            return ResponseEntity.ok(MapUtils.createResponseMap(true, "API Key保存成功"));
            
        } catch (Exception e) {
            log.error("保存API Key失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.createResponseMap(false, "保存失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取用户的通义千问API Key状态
     * 
     * @param userId 用户ID
     * @return API Key状态
     */
    @GetMapping("/{userId}/api-key/status")
    public ResponseEntity<?> getApiKeyStatus(@PathVariable Long userId) {
        try {
            log.info("获取用户API Key状态: userId={}", userId);
            
            String apiKey = userService.getQwenApiKey(userId);
            boolean hasApiKey = apiKey != null && !apiKey.trim().isEmpty();
            
            Map<String, Object> response = MapUtils.createResponseMap(true, "获取成功");
            response.put("hasApiKey", hasApiKey);
            response.put("maskedApiKey", hasApiKey ? maskApiKey(apiKey) : null);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("获取API Key状态失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.createResponseMap(false, "获取失败: " + e.getMessage()));
        }
    }
    
    /**
     * 删除用户的通义千问API Key
     * 
     * @param userId 用户ID
     * @return 删除结果
     */
    @DeleteMapping("/{userId}/api-key")
    public ResponseEntity<?> deleteApiKey(@PathVariable Long userId) {
        try {
            log.info("删除用户API Key请求: userId={}", userId);
            
            userService.deleteQwenApiKey(userId);
            
            return ResponseEntity.ok(MapUtils.createResponseMap(true, "API Key删除成功"));
            
        } catch (Exception e) {
            log.error("删除API Key失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.createResponseMap(false, "删除失败: " + e.getMessage()));
        }
    }
    
    /**
     * 掩码API Key（只显示前几位和后几位）
     * 
     * @param apiKey 原始API Key
     * @return 掩码后的API Key
     */
    private String maskApiKey(String apiKey) {
        if (apiKey == null || apiKey.length() <= 8) {
            return "****";
        }
        
        int start = Math.min(4, apiKey.length() / 3);
        int end = Math.min(4, apiKey.length() / 3);
        String masked = apiKey.substring(0, start) + "****" + apiKey.substring(apiKey.length() - end);
        return masked;
    }
    
    public static class UserResponse {
        private Long id;
        private String username;
        private String email;
        private String phone;
        private String fullName;
        private String avatarUrl;
        private User.UserRole role;
        private Boolean isActive;
        private java.time.LocalDateTime createdAt;
        
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
        public User.UserRole getRole() { return role; }
        public void setRole(User.UserRole role) { this.role = role; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
    
    /**
     * API Key请求类
     */
    public static class ApiKeyRequest {
        private String apiKey;
        
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    }
}
