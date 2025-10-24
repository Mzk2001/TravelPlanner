const axios = require('axios');

async function testApi() {
    try {
        console.log('🔐 正在登录...');
        
        // 登录获取token
        const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
            username: 'test',
            password: 'test123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ 登录成功，token:', token.substring(0, 20) + '...');
        
        // 发送测试消息
        console.log('📤 发送测试消息...');
        const chatResponse = await axios.post('http://localhost:8080/api/conversations/chat', {
            userId: 1,
            message: '我想去日本东京旅游，预算1万元，2个人，喜欢美食和动漫'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 收到响应:');
        console.log('  - message长度:', chatResponse.data.message?.length || 0);
        console.log('  - processingTime:', chatResponse.data.processingTime);
        console.log('  - extractedFields:', chatResponse.data.extractedFields);
        
        if (chatResponse.data.extractedFields) {
            console.log('🔍 提取字段详情:');
            console.log('  - destination:', chatResponse.data.extractedFields.destination);
            console.log('  - budget:', chatResponse.data.extractedFields.budget);
            console.log('  - groupSize:', chatResponse.data.extractedFields.groupSize);
            console.log('  - travelType:', chatResponse.data.extractedFields.travelType);
        } else {
            console.log('❌ 没有提取到字段');
        }
        
        // 获取对话历史
        console.log('📋 获取对话历史...');
        const conversationsResponse = await axios.get('http://localhost:8080/api/conversations', {
            params: {
                userId: 1,
                page: 0,
                size: 10
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📋 对话历史:');
        if (conversationsResponse.data?.content) {
            conversationsResponse.data.content.forEach((conv, index) => {
                console.log(`  对话 ${index + 1}:`);
                console.log(`    - id: ${conv.id}`);
                console.log(`    - userMessage: ${conv.userMessage?.substring(0, 50)}...`);
                console.log(`    - extractedFields: ${conv.extractedFields ? '有' : '无'}`);
                if (conv.extractedFields) {
                    console.log(`      - destination: ${conv.extractedFields.destination}`);
                    console.log(`      - budget: ${conv.extractedFields.budget}`);
                    console.log(`      - groupSize: ${conv.extractedFields.groupSize}`);
                    console.log(`      - travelType: ${conv.extractedFields.travelType}`);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data || error.message);
    }
}

testApi();
