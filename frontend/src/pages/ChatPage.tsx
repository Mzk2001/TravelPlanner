import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, 
  Card, 
  Input, 
  Button, 
  List, 
  Avatar, 
  Typography, 
  Space, 
  Select, 
  Row,
  Col,
  Tooltip,
  Upload,
  message as antdMessage
} from 'antd';
import { 
  SendOutlined, 
  RobotOutlined, 
  UserOutlined, 
  AudioOutlined,
  AudioMutedOutlined,
  FileOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Header from '../components/Header';
import { Conversation, ChatRequest, ChatResponse, TravelPlan } from '../types';
import dayjs from 'dayjs';

const { Content } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchPlans();
    }
  }, [user, selectedPlanId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const response = await apiService.getConversations(user.id, selectedPlanId);
      setConversations(response.content.reverse()); // 反转以显示最新的在底部
    } catch (error) {
      console.error('获取对话历史失败:', error);
    }
  };

  const fetchPlans = async () => {
    if (!user) return;
    
    try {
      const response = await apiService.getUserPlans(user.id);
      setPlans(response.content);
    } catch (error) {
      console.error('获取计划列表失败:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    const userMessage = message.trim();
    setMessage('');
    setLoading(true);

    // 立即显示用户消息
    const tempUserMessage: Conversation = {
      id: Date.now(),
      userId: user.id,
      planId: selectedPlanId,
      userMessage: userMessage,
      aiResponse: '',
      messageType: 'text',
      processingTime: 0,
      createdAt: new Date().toISOString(),
    };

    setConversations(prev => [...prev, tempUserMessage]);

    try {
      const chatRequest: ChatRequest = {
        userId: user.id,
        planId: selectedPlanId,
        message: userMessage,
      };

      const response: ChatResponse = await apiService.sendMessage(chatRequest);
      
      // 更新最后一条消息
      setConversations(prev => 
        prev.map(conv => 
          conv.id === tempUserMessage.id 
            ? { ...conv, aiResponse: response.message, processingTime: response.processingTime }
            : conv
        )
      );
    } catch (error) {
      antdMessage.error('发送消息失败，请重试');
      // 移除失败的消息
      setConversations(prev => prev.filter(conv => conv.id !== tempUserMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceRecord = () => {
    if (!user) return;
    
    setIsRecording(true);
    // 这里应该实现语音录制功能
    // 由于浏览器API限制，这里只是示例
    antdMessage.info('语音录制功能需要用户授权，请使用文本输入');
    setTimeout(() => setIsRecording(false), 2000);
  };

  const handleFileUpload = (file: File) => {
    if (!user) return;
    
    if (file.type.startsWith('audio/')) {
      // 处理音频文件
      handleVoiceMessage(file);
    } else {
      antdMessage.error('请上传音频文件');
    }
    return false; // 阻止默认上传行为
  };

  const handleVoiceMessage = async (audioFile: File) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiService.sendVoiceMessage(user.id, selectedPlanId, audioFile);
      
      const newConversation: Conversation = {
        id: Date.now(),
        userId: user.id,
        planId: selectedPlanId,
        userMessage: response.userMessage,
        aiResponse: response.aiResponse,
        messageType: 'voice',
        voiceFileUrl: response.voiceFileUrl,
        processingTime: response.processingTime,
        createdAt: response.timestamp,
      };
      
      setConversations(prev => [...prev, newConversation]);
    } catch (error) {
      antdMessage.error('语音消息发送失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: '24px' }}>
        <Row gutter={24} style={{ height: 'calc(100vh - 120px)' }}>
          {/* 左侧：计划选择 */}
          <Col xs={24} lg={6}>
            <Card title="选择计划" style={{ height: '100%' }}>
              <Select
                style={{ width: '100%', marginBottom: 16 }}
                placeholder="选择旅游计划（可选）"
                value={selectedPlanId}
                onChange={setSelectedPlanId}
                allowClear
              >
                {plans.map(plan => (
                  <Option key={plan.id} value={plan.id}>
                    {plan.planName} - {plan.destination}
                  </Option>
                ))}
              </Select>
              
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  {selectedPlanId 
                    ? `已选择计划，AI将基于此计划提供建议`
                    : `未选择计划，AI将提供通用旅游建议`
                  }
                </Text>
              </div>
            </Card>
          </Col>

          {/* 右侧：聊天界面 */}
          <Col xs={24} lg={18}>
            <Card 
              title={
                <Space>
                  <RobotOutlined />
                  <span>AI旅游助手</span>
                  {selectedPlanId && (
                    <Text type="secondary">
                      (基于计划: {plans.find(p => p.id === selectedPlanId)?.planName})
                    </Text>
                  )}
                </Space>
              }
              style={{ height: '100%' }}
              bodyStyle={{ 
                height: 'calc(100% - 57px)', 
                display: 'flex', 
                flexDirection: 'column' 
              }}
            >
              {/* 消息列表 */}
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                marginBottom: 16,
                padding: '0 16px'
              }}>
                {conversations.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 0',
                    color: '#999'
                  }}>
                    <RobotOutlined style={{ fontSize: '48px', marginBottom: 16 }} />
                    <div>开始与AI助手对话，获取智能旅游建议</div>
                  </div>
                ) : (
                  <List
                    dataSource={conversations}
                    renderItem={(conv) => (
                      <div key={conv.id} style={{ marginBottom: 16 }}>
                        {/* 用户消息 */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'flex-end',
                          marginBottom: 8
                        }}>
                          <div style={{ 
                            maxWidth: '70%',
                            background: '#1890ff',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '12px 12px 4px 12px'
                          }}>
                            <div>{conv.userMessage}</div>
                            <div style={{ 
                              fontSize: '12px', 
                              opacity: 0.8,
                              marginTop: 4
                            }}>
                              {dayjs(conv.createdAt).format('HH:mm')}
                            </div>
                          </div>
                          <Avatar 
                            icon={<UserOutlined />} 
                            style={{ marginLeft: 8 }}
                          />
                        </div>

                        {/* AI回复 */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'flex-start',
                          marginBottom: 8
                        }}>
                          <Avatar 
                            icon={<RobotOutlined />} 
                            style={{ marginRight: 8 }}
                          />
                          <div style={{ 
                            maxWidth: '70%',
                            background: '#f5f5f5',
                            padding: '8px 12px',
                            borderRadius: '12px 12px 12px 4px'
                          }}>
                            <div>{conv.aiResponse}</div>
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#999',
                              marginTop: 4
                            }}>
                              {dayjs(conv.createdAt).format('HH:mm')}
                              {conv.processingTime > 0 && (
                                <span> · {conv.processingTime}ms</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div style={{ 
                borderTop: '1px solid #f0f0f0',
                padding: '16px 0 0 0'
              }}>
                <Space.Compact style={{ width: '100%' }}>
                  <TextArea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入您的问题或需求..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    disabled={loading}
                    style={{ flex: 1 }}
                  />
                  <Tooltip title="语音输入">
                    <Button
                      icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
                      onClick={handleVoiceRecord}
                      disabled={loading}
                    />
                  </Tooltip>
                  <Upload
                    beforeUpload={handleFileUpload}
                    showUploadList={false}
                    accept="audio/*"
                  >
                    <Tooltip title="上传音频文件">
                      <Button
                        icon={<FileOutlined />}
                        disabled={loading}
                      />
                    </Tooltip>
                  </Upload>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={loading}
                    disabled={!message.trim()}
                  >
                    发送
                  </Button>
                </Space.Compact>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default ChatPage;
