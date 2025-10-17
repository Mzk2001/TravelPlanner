package com.travelplanner.security;

import com.travelplanner.entity.User;
import com.travelplanner.service.UserService;
import com.travelplanner.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;
import com.travelplanner.util.MapUtils;
import java.util.Optional;

/**
 * 认证控制器
 * 
 * @author TravelPlanner Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    
    /**
     * 用户登录
     * 
     * @param request 登录请求
     * @return 登录结果
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("用户登录请求: username={}", request.getUsername());
            
            // 验证用户凭据
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
                )
            );
            
            // 获取用户信息
            Optional<User> userOpt = userService.findByUsername(request.getUsername());
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(MapUtils.of("error", "用户不存在"));
            }
            
            User user = userOpt.get();
            
            // 生成JWT令牌
            String token = jwtUtil.generateToken(user.getUsername(), user.getId());
            
            // 构建响应
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setTokenType("Bearer");
            response.setExpiresIn(86400); // 24小时
            response.setUser(new UserInfo(user));
            
            log.info("用户登录成功: userId={}", user.getId());
            return ResponseEntity.ok(response);
            
        } catch (AuthenticationException e) {
            log.error("用户登录失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", "用户名或密码错误"));
        } catch (Exception e) {
            log.error("登录过程中发生错误: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("error", "登录失败"));
        }
    }
    
    /**
     * 验证令牌
     * 
     * @param token JWT令牌
     * @return 验证结果
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            if (token == null || token.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(MapUtils.of("valid", false, "error", "令牌不能为空"));
            }
            
            boolean isValid = jwtUtil.validateToken(token);
            if (isValid) {
                String username = jwtUtil.getUsernameFromToken(token);
                Long userId = jwtUtil.getUserIdFromToken(token);
                
                return ResponseEntity.ok(MapUtils.of(
                    "valid", true,
                    "username", username,
                    "userId", userId
                ));
            } else {
                return ResponseEntity.ok(MapUtils.of("valid", false));
            }
            
        } catch (Exception e) {
            log.error("令牌验证失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MapUtils.of("valid", false, "error", e.getMessage()));
        }
    }
    
    // 内部类：请求和响应DTO
    public static class LoginRequest {
        private String username;
        private String password;
        
        // Getters and Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    public static class LoginResponse {
        private String token;
        private String tokenType;
        private Integer expiresIn;
        private UserInfo user;
        
        // Getters and Setters
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getTokenType() { return tokenType; }
        public void setTokenType(String tokenType) { this.tokenType = tokenType; }
        public Integer getExpiresIn() { return expiresIn; }
        public void setExpiresIn(Integer expiresIn) { this.expiresIn = expiresIn; }
        public UserInfo getUser() { return user; }
        public void setUser(UserInfo user) { this.user = user; }
    }
    
    public static class UserInfo {
        private Long id;
        private String username;
        private String email;
        private String phone;
        private String fullName;
        private String avatarUrl;
        private User.UserRole role;
        private Boolean isActive;
        
        public UserInfo(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.phone = user.getPhone();
            this.fullName = user.getFullName();
            this.avatarUrl = user.getAvatarUrl();
            this.role = user.getRole();
            this.isActive = user.getIsActive();
        }
        
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
    }
}

