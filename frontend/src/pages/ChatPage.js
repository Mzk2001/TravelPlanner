import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, List, Avatar, Spin, message, Form } from 'antd';
import { SendOutlined, AudioOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { conversationAPI, planAPI } from '../services/api';
import dayjs from 'dayjs';

const { TextArea } = Input;

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [form] = Form.useForm();
  const messagesEndRef = useRef(null);
  
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (planId) {
      loadPlan();
    }
    loadMessages();
  }, [planId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadPlan = async () => {
    try {
      const response = await planAPI.getPlan(planId);
      setPlan(response.data);
    } catch (error) {
      message.error('加载计划失败');
    }
  };

  const loadMessages = async () => {
    try {
      const response = await conversationAPI.getConversations(
        user.id, 
        planId || null, 
        0, 
        50
      );
      setMessages(response.data.content || []);
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  };

  const sendMessage = async (values) => {
    if (!values.message.trim()) return;

    const userMessage = {
      userId: user.id,
      planId: planId || null,
      message: values.message.trim()
    };

    // 添加用户消息到界面
    const newUserMessage = {
      id: Date.now(),
      userMessage: userMessage.message,
      messageType: 'text',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    form.resetFields();
    setLoading(true);

    try {
      const response = await conversationAPI.sendMessage(userMessage);
      const aiResponse = response.data;

      // 添加AI回复到界面
      const newAiMessage = {
        id: Date.now() + 1,
        aiResponse: aiResponse.message,
        messageType: 'text',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, newAiMessage]);

    } catch (error) {
      message.error('发送消息失败');
      // 移除失败的用户消息
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceMessage = async (audioBlob) => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      if (planId) formData.append('planId', planId);
      formData.append('audio', audioBlob);

      const response = await conversationAPI.sendVoiceMessage(formData);
      const { userMessage, aiResponse, voiceFileUrl } = response.data;

      // 添加语音对话到界面
      const newMessages = [
        {
          id: Date.now(),
          userMessage,
          messageType: 'voice',
          createdAt: new Date().toISOString()
        },
        {
          id: Date.now() + 1,
          aiResponse,
          messageType: 'voice',
          voiceFileUrl,
          createdAt: new Date().toISOString()
        }
      ];
      setMessages(prev => [...prev, ...newMessages]);

    } catch (error) {
      message.error('语音消息发送失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 120px)' }}>
      <Card 
        title={plan ? `与AI助手对话 - ${plan.planName}` : 'AI旅游助手'}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* 消息列表 */}
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '16px',
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            marginBottom: '16px',
            backgroundColor: '#fafafa'
          }}
        >
          {messages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#999'
            }}>
              开始与AI助手对话，规划您的完美旅行！
            </div>
          ) : (
            <List
              dataSource={messages}
              renderItem={(msg) => (
                <div style={{ marginBottom: '16px' }}>
                  {/* 用户消息 */}
                  {msg.userMessage && (
                    <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                      <div style={{ 
                        display: 'inline-block',
                        maxWidth: '70%',
                        padding: '12px 16px',
                        backgroundColor: '#1890ff',
                        color: 'white',
                        borderRadius: '18px 18px 4px 18px',
                        wordWrap: 'break-word'
                      }}>
                        {msg.userMessage}
                      </div>
                    </div>
                  )}
                  
                  {/* AI回复 */}
                  {msg.aiResponse && (
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ 
                        display: 'inline-block',
                        maxWidth: '70%',
                        padding: '12px 16px',
                        backgroundColor: 'white',
                        border: '1px solid #d9d9d9',
                        borderRadius: '18px 18px 18px 4px',
                        wordWrap: 'break-word'
                      }}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {msg.aiResponse}
                        </div>
                        {msg.voiceFileUrl && (
                          <div style={{ marginTop: '8px' }}>
                            <audio controls>
                              <source src={msg.voiceFileUrl} type="audio/mpeg" />
                            </audio>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 */}
        <Form form={form} onFinish={sendMessage}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Form.Item 
              name="message" 
              style={{ flex: 1, margin: 0 }}
              rules={[{ required: true, message: '请输入消息' }]}
            >
              <TextArea
                placeholder="输入您的旅游需求..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    form.submit();
                  }
                }}
              />
            </Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
            >
              发送
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ChatPage;


