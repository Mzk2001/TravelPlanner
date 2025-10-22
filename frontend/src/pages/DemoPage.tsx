import React, { useState } from 'react';
import { Card, Button, Input, Space, Typography, Alert, Divider, message } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import apiService from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const DemoPage: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
  }>>([]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      message.warning('请输入消息');
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // 添加用户消息
    const newChatHistory = [...chatHistory, {
      type: 'user' as const,
      content: userMessage,
      timestamp: new Date().toLocaleTimeString()
    }];
    setChatHistory(newChatHistory);

    try {
      // 获取用户配置的API Key
      const customApiKey = localStorage.getItem('qwen_api_key');
      
      if (!customApiKey) {
        message.error('请先在设置页面配置API Key');
        setChatHistory([...newChatHistory, {
          type: 'ai',
          content: '请先在设置页面配置您的阿里云百炼API Key，然后才能使用AI功能。',
          timestamp: new Date().toLocaleTimeString()
        }]);
        return;
      }

      // 调用AI服务
      const response = await apiService.sendMessage({
        userId: 1, // 演示用
        message: userMessage,
        apiKey: customApiKey
      });

      // 添加AI回复
      setChatHistory([...newChatHistory, {
        type: 'ai',
        content: response.message,
        timestamp: new Date().toLocaleTimeString()
      }]);

    } catch (error) {
      message.error('发送消息失败');
      setChatHistory([...newChatHistory, {
        type: 'ai',
        content: '抱歉，AI服务暂时不可用，请检查您的API Key配置。',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>
        <RobotOutlined style={{ marginRight: 8 }} />
        AI 聊天演示
      </Title>

      <Alert
        message="演示说明"
        description="这是一个AI聊天演示页面。请先在设置页面配置您的阿里云百炼API Key，然后就可以在这里与AI进行对话了。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="聊天界面" style={{ marginBottom: 16 }}>
        <div style={{ 
          height: 400, 
          border: '1px solid #d9d9d9', 
          borderRadius: 6, 
          padding: 16, 
          overflowY: 'auto',
          marginBottom: 16,
          backgroundColor: '#fafafa'
        }}>
          {chatHistory.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#999', 
              marginTop: 100 
            }}>
              <RobotOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <br />
              开始与AI对话吧！
            </div>
          ) : (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {chatHistory.map((chat, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: chat.type === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 16
                }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    backgroundColor: chat.type === 'user' ? '#1890ff' : '#f0f0f0',
                    color: chat.type === 'user' ? 'white' : 'black'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      {chat.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      <Text style={{ 
                        marginLeft: 8, 
                        fontSize: 12, 
                        color: chat.type === 'user' ? 'rgba(255,255,255,0.8)' : '#999'
                      }}>
                        {chat.timestamp}
                      </Text>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {chat.content}
                    </div>
                  </div>
                </div>
              ))}
            </Space>
          )}
        </div>

        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            placeholder="输入您的消息..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={2}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={loading}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            发送
          </Button>
        </Space.Compact>
      </Card>

      <Card title="功能说明">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>1. API Key 配置</Text>
            <br />
            <Text type="secondary">
              在设置页面配置您的阿里云百炼API Key，这是使用AI功能的前提条件。
            </Text>
          </div>
          
          <div>
            <Text strong>2. 智能对话</Text>
            <br />
            <Text type="secondary">
              AI助手可以回答旅游相关问题，提供行程建议、景点推荐等。
            </Text>
          </div>
          
          <div>
            <Text strong>3. 上下文理解</Text>
            <br />
            <Text type="secondary">
              AI能够理解对话上下文，提供连贯的回复和建议。
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default DemoPage;
