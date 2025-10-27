// 测试API Key保存功能
const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function testApiKeyFunctionality() {
    try {
        console.log('🚀 开始测试API Key保存功能...\n');
        
        // 1. 首先注册一个测试用户
        console.log('1. 注册测试用户...');
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            username: 'testuser',
            password: 'testpass123',
            email: 'test@example.com'
        });
        console.log('✅ 用户注册成功:', registerResponse.data);
        
        const userId = registerResponse.data.data.id;
        console.log(`📝 用户ID: ${userId}\n`);
        
        // 2. 检查初始API Key状态
        console.log('2. 检查初始API Key状态...');
        const statusResponse = await axios.get(`${BASE_URL}/users/${userId}/api-key/status`);
        console.log('📊 API Key状态:', statusResponse.data);
        console.log(`🔍 是否有API Key: ${statusResponse.data.data.hasApiKey}\n`);
        
        // 3. 保存API Key
        console.log('3. 保存测试API Key...');
        const testApiKey = 'sk-test123456789abcdef';
        const saveResponse = await axios.post(`${BASE_URL}/users/${userId}/api-key`, {
            apiKey: testApiKey
        });
        console.log('💾 API Key保存结果:', saveResponse.data);
        
        // 4. 再次检查API Key状态
        console.log('\n4. 验证API Key是否保存成功...');
        const statusResponse2 = await axios.get(`${BASE_URL}/users/${userId}/api-key/status`);
        console.log('📊 更新后的API Key状态:', statusResponse2.data);
        console.log(`🔍 是否有API Key: ${statusResponse2.data.data.hasApiKey}`);
        console.log(`🎭 掩码后的API Key: ${statusResponse2.data.data.maskedApiKey}\n`);
        
        // 5. 测试API Key删除
        console.log('5. 测试API Key删除...');
        const deleteResponse = await axios.delete(`${BASE_URL}/users/${userId}/api-key`);
        console.log('🗑️ API Key删除结果:', deleteResponse.data);
        
        // 6. 最终检查API Key状态
        console.log('\n6. 最终验证API Key是否删除成功...');
        const statusResponse3 = await axios.get(`${BASE_URL}/users/${userId}/api-key/status`);
        console.log('📊 最终API Key状态:', statusResponse3.data);
        console.log(`🔍 是否有API Key: ${statusResponse3.data.data.hasApiKey}\n`);
        
        console.log('🎉 API Key功能测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.log('💡 提示: 可能需要先登录获取JWT token');
        }
    }
}

// 等待后端启动
setTimeout(() => {
    testApiKeyFunctionality();
}, 5000);
