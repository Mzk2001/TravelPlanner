// 测试登录API的简单脚本
const axios = require('axios');

async function testLogin() {
    try {
        console.log('测试登录API...');
        
        // 首先尝试注册一个测试用户
        console.log('1. 注册测试用户...');
        const registerResponse = await axios.post('http://localhost:8080/api/users/register', {
            username: 'testuser123',
            password: 'password123',
            email: 'test@example.com'
        });
        console.log('注册成功:', registerResponse.data);
        
        // 然后尝试登录
        console.log('2. 尝试登录...');
        const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
            username: 'testuser123',
            password: 'password123'
        });
        console.log('登录成功:', loginResponse.data);
        
    } catch (error) {
        console.error('测试失败:', error.response?.data || error.message);
    }
}

testLogin();



