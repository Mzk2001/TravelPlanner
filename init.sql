-- 创建数据库（如果不存在）
-- 注意：PostgreSQL中CREATE DATABASE IF NOT EXISTS语法在较新版本中支持
-- 如果版本不支持，请手动创建数据库：createdb travel_planner

-- 使用数据库
\c travel_planner;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    full_name VARCHAR(50),
    avatar_url VARCHAR(500),
    user_role VARCHAR(20) DEFAULT 'USER',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建旅游计划表
CREATE TABLE IF NOT EXISTS travel_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    destination VARCHAR(100),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    budget DECIMAL(10,2),
    travel_type VARCHAR(50),
    group_size INTEGER,
    special_requirements TEXT,
    status VARCHAR(20) DEFAULT 'DRAFT',
    ai_generated TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建对话记录表
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_id BIGINT,
    user_message TEXT,
    ai_response TEXT,
    message_type VARCHAR(50),
    voice_file_url VARCHAR(500),
    processing_time BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES travel_plans(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_status ON travel_plans(status);
CREATE INDEX IF NOT EXISTS idx_travel_plans_destination ON travel_plans(destination);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_plan_id ON conversations(plan_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- 插入测试数据
INSERT INTO users (username, password, email, full_name) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'admin@travelplanner.com', '管理员'),
('testuser', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'test@travelplanner.com', '测试用户')
ON CONFLICT (username) DO NOTHING;
