-- H2数据库初始化脚本
-- 插入测试用户数据

-- 注意：密码是 'password' 的BCrypt哈希值
INSERT INTO users (username, password, email, full_name, user_role, is_active, qwen_api_key, created_at, updated_at) VALUES 
('test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'test@example.com', '测试用户', 'USER', true, 'sk-test-api-key-for-demo-purposes-only', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@travelplanner.com', '管理员', 'ADMIN', true, 'sk-admin-api-key-for-demo-purposes-only', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
