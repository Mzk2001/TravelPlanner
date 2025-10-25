import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
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
  message as antdMessage,
  Modal,
  Form
} from 'antd';
import { 
  SendOutlined, 
  RobotOutlined, 
  UserOutlined, 
  AudioOutlined,
  AudioMutedOutlined,
  FileOutlined,
  SaveOutlined,
  EditOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Conversation, ChatRequest, ChatResponse, TravelPlan, ExtractedFields } from '../types';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import VoiceConfigModal from '../components/VoiceConfigModal';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingConversation, setEditingConversation] = useState<Conversation | null>(null);
  const [savedPlanId, setSavedPlanId] = useState<number | null>(null);
  const [voiceConfigVisible, setVoiceConfigVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 语音录制Hook
  const {
    isRecording,
    isProcessing,
    error: voiceError,
    transcript,
    startRecording,
    stopRecording,
    clearError: clearVoiceError,
    clearTranscript
  } = useVoiceRecorder();

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchPlans();
    }
  }, [user, selectedPlanId]);

  // 从URL参数初始化selectedPlanId
  useEffect(() => {
    const planIdParam = searchParams.get('planId');
    if (planIdParam) {
      setSelectedPlanId(parseInt(planIdParam));
    }
  }, [searchParams]);

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  // 处理语音识别结果
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
      clearTranscript();
      // 自动发送语音识别的消息
      setTimeout(() => {
        handleSendMessage();
      }, 500); // 延迟500ms确保状态更新完成
    }
  }, [transcript, clearTranscript]);

  // 处理语音错误
  useEffect(() => {
    if (voiceError) {
      antdMessage.error(voiceError);
      clearVoiceError();
    }
  }, [voiceError, clearVoiceError]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      console.log('🔍 开始获取对话数据...', { userId: user.id, selectedPlanId });
      const response = await apiService.getConversations(user.id, selectedPlanId);
      console.log('📥 获取到的对话数据:', response);
      console.log('📋 对话内容详情:', response.content);
      
      // 检查每个对话的extractedFields
      response.content.forEach((conv, index) => {
        console.log(`💬 对话 ${index + 1}:`, {
          id: conv.id,
          userMessage: conv.userMessage,
          aiResponse: conv.aiResponse?.substring(0, 100) + '...',
          extractedFields: conv.extractedFields,
          hasExtractedFields: !!conv.extractedFields,
          extractedFieldsType: typeof conv.extractedFields
        });
      });
      
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

    // 添加AI思考中的提示消息
    const thinkingMessage: Conversation = {
      id: Date.now() + 1,
      userId: user.id,
      planId: selectedPlanId,
      userMessage: '',
      aiResponse: 'AI正在思考中，请稍候...',
      messageType: 'text',
      processingTime: 0,
      createdAt: new Date().toISOString(),
    };

    setConversations(prev => [...prev, tempUserMessage, thinkingMessage]);

    try {
      // 获取用户配置的API Key
      const customApiKey = localStorage.getItem('qwen_api_key');
      
      const chatRequest: ChatRequest = {
        userId: user.id,
        planId: selectedPlanId,
        message: userMessage,
        apiKey: customApiKey || undefined
      };

      const response: ChatResponse = await apiService.sendMessage(chatRequest);
      
      // 更新AI思考中的消息为实际回复
      console.log('🤖 AI回复内容:', response.message);
      console.log('⏱️ 处理时间:', response.processingTime);
      console.log('📋 提取的字段:', response.extractedFields);
      console.log('🔍 提取字段详情:', {
        destination: response.extractedFields?.destination,
        budget: response.extractedFields?.budget,
        groupSize: response.extractedFields?.groupSize,
        travelType: response.extractedFields?.travelType,
        hasExtractedFields: !!response.extractedFields,
        extractedFieldsType: typeof response.extractedFields
      });
      
      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === thinkingMessage.id) {
            const updatedConv = { 
              ...conv, 
              aiResponse: response.message, 
              processingTime: response.processingTime,
              extractedFields: response.extractedFields
            };
            console.log('🔄 更新后的对话:', updatedConv);
            console.log('📋 更新后的提取字段:', updatedConv.extractedFields);
            console.log('🔍 字段检查:', {
              hasExtractedFields: !!updatedConv.extractedFields,
              extractedFieldsType: typeof updatedConv.extractedFields,
              destination: updatedConv.extractedFields?.destination,
              budget: updatedConv.extractedFields?.budget,
              groupSize: updatedConv.extractedFields?.groupSize,
              travelType: updatedConv.extractedFields?.travelType
            });
            return updatedConv;
          }
          return conv;
        })
      );
    } catch (error) {
      antdMessage.error('发送消息失败，请重试');
      // 移除失败的消息和思考中的消息
      setConversations(prev => prev.filter(conv => 
        conv.id !== tempUserMessage.id && conv.id !== thinkingMessage.id
      ));
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
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
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

  const handleSaveAsPlan = async (conversationId: number) => {
    if (!user) return;
    
    try {
      // 找到对应的对话对象
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (!conversation) {
        antdMessage.error('找不到对应的对话');
        return;
      }
      
      console.log('💾 保存计划 - 对话信息:', {
        id: conversation.id,
        aiResponse: conversation.aiResponse?.substring(0, 100) + '...',
        extractedFields: conversation.extractedFields,
        hasExtractedFields: !!conversation.extractedFields
      });
      
      // 如果有提取的字段，使用新的API方法
      if (conversation.extractedFields && conversation.aiResponse) {
        console.log('✅ 使用提取字段保存计划:', conversation.extractedFields);
        const response = await apiService.saveAsPlanWithFields(
          user.id, 
          conversation.aiResponse, 
          conversation.extractedFields
        );
        antdMessage.success('旅游计划保存成功！已自动填充提取的字段');
        
        // 记录保存的计划ID
        setSavedPlanId(response.planId);
      } else {
        console.log('⚠️ 没有提取字段，使用原有方法保存');
        // 使用原有的方法
        const response = await apiService.saveAsPlan(user.id, conversationId);
        antdMessage.success('旅游计划保存成功！');
        
        // 记录保存的计划ID
        setSavedPlanId(response.planId);
      }
      
      // 刷新计划列表
      fetchPlans();
    } catch (error) {
      console.error('保存计划失败:', error);
      antdMessage.error('保存旅游计划失败');
    }
  };

  const handleEditPlan = (conversation: Conversation) => {
    setEditingConversation(conversation);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingConversation || !user) return;
    
    try {
      // 更新对话中的AI回复
      const updatedConversation = {
        ...editingConversation,
        aiResponse: values.aiResponse
      };
      
      // 这里可以调用API更新对话，或者直接更新本地状态
      setConversations(prev => 
        prev.map(conv => 
          conv.id === editingConversation.id ? updatedConversation : conv
        )
      );
      
      antdMessage.success('AI方案修改成功！');
      setEditModalVisible(false);
      setEditingConversation(null);
    } catch (error) {
      antdMessage.error('修改失败，请重试');
    }
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
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
                    renderItem={(conv) => {
                      // 添加渲染时的日志
                      console.log('🎨 渲染对话:', {
                        id: conv.id,
                        userMessage: conv.userMessage,
                        aiResponse: conv.aiResponse?.substring(0, 50) + '...',
                        extractedFields: conv.extractedFields,
                        hasExtractedFields: !!conv.extractedFields,
                        extractedFieldsType: typeof conv.extractedFields
                      });
                      
                      return (
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
                            
                            {/* 显示提取的字段 */}
                            {conv.extractedFields && (
                              <div style={{
                                marginTop: 12,
                                padding: '8px 12px',
                                background: '#e6f7ff',
                                border: '1px solid #91d5ff',
                                borderRadius: '6px',
                                fontSize: '13px'
                              }}>
                                <div style={{ fontWeight: 'bold', marginBottom: 6, color: '#1890ff' }}>
                                  📋 提取的旅行信息
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  {conv.extractedFields.destination && (
                                    <span style={{ 
                                      background: '#f0f0f0', 
                                      padding: '2px 6px', 
                                      borderRadius: '4px',
                                      fontSize: '12px'
                                    }}>
                                      🏛️ 目的地: {conv.extractedFields.destination}
                                    </span>
                                  )}
                                  {conv.extractedFields.budget && (
                                    <span style={{ 
                                      background: '#f0f0f0', 
                                      padding: '2px 6px', 
                                      borderRadius: '4px',
                                      fontSize: '12px'
                                    }}>
                                      💰 预算: ¥{conv.extractedFields.budget}
                                    </span>
                                  )}
                                  {conv.extractedFields.groupSize && (
                                    <span style={{ 
                                      background: '#f0f0f0', 
                                      padding: '2px 6px', 
                                      borderRadius: '4px',
                                      fontSize: '12px'
                                    }}>
                                      👥 人数: {conv.extractedFields.groupSize}人
                                    </span>
                                  )}
                                  {conv.extractedFields.travelType && (
                                    <span style={{ 
                                      background: '#f0f0f0', 
                                      padding: '2px 6px', 
                                      borderRadius: '4px',
                                      fontSize: '12px'
                                    }}>
                                      🎯 类型: {conv.extractedFields.travelType}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#999',
                              marginTop: 4,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span>
                                {dayjs(conv.createdAt).format('HH:mm')}
                                {conv.processingTime > 0 && (
                                  <span> · {conv.processingTime}ms</span>
                                )}
                              </span>
                              {(() => {
                                console.log('检查按钮显示条件:', {
                                  aiResponse: conv.aiResponse,
                                  hasResponse: !!conv.aiResponse,
                                  notThinking: conv.aiResponse !== 'AI正在思考中，请稍候...',
                                  shouldShow: conv.aiResponse && conv.aiResponse !== 'AI正在思考中，请稍候...'
                                });
                                return conv.aiResponse && conv.aiResponse !== 'AI正在思考中，请稍候...';
                              })() && (
                                <Space size="small">
                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<SaveOutlined />}
                                    onClick={() => handleSaveAsPlan(conv.id)}
                                    style={{ 
                                      padding: 0, 
                                      height: 'auto',
                                      fontSize: '12px',
                                      color: '#1890ff'
                                    }}
                                  >
                                    保存为计划
                                  </Button>
                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditPlan(conv)}
                                    style={{ 
                                      padding: 0, 
                                      height: 'auto',
                                      fontSize: '12px',
                                      color: '#52c41a'
                                    }}
                                  >
                                    编辑方案
                                  </Button>
                                </Space>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      );
                    }}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div style={{ 
                borderTop: '1px solid #f0f0f0',
                padding: '16px 0 0 0'
              }}>
                {/* 语音状态显示 */}
                {(isRecording || isProcessing) && (
                  <div style={{ 
                    marginBottom: '12px',
                    padding: '8px 12px',
                    background: isRecording ? '#fff2e8' : '#f6ffed',
                    border: `1px solid ${isRecording ? '#ffd591' : '#b7eb8f'}`,
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <Space>
                      <AudioOutlined style={{ color: isRecording ? '#fa8c16' : '#52c41a' }} />
                      <Text style={{ color: isRecording ? '#fa8c16' : '#52c41a' }}>
                        {isRecording ? '正在录音...' : '正在识别语音...'}
                      </Text>
                    </Space>
                  </div>
                )}
                
                <Space.Compact style={{ width: '100%' }}>
                  <TextArea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入您的问题或需求..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    disabled={loading || isProcessing}
                    style={{ flex: 1 }}
                  />
                  <Tooltip title={isRecording ? "停止录音" : "开始录音"}>
                    <Button
                      icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
                      onClick={handleVoiceRecord}
                      disabled={loading || isProcessing}
                      type={isRecording ? "primary" : "default"}
                      style={{ 
                        background: isRecording ? '#ff4d4f' : undefined,
                        borderColor: isRecording ? '#ff4d4f' : undefined
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="语音配置">
                    <Button
                      icon={<SettingOutlined />}
                      onClick={() => setVoiceConfigVisible(true)}
                      disabled={loading || isProcessing}
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
                        disabled={loading || isProcessing}
                      />
                    </Tooltip>
                  </Upload>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={loading}
                    disabled={!message.trim() || isProcessing}
                  >
                    发送
                  </Button>
                </Space.Compact>
              </div>
            </Card>
          </Col>
        </Row>

      {/* 编辑AI方案模态框 */}
      <Modal
        title="编辑AI方案"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingConversation(null);
        }}
        onOk={() => {
          // 这里可以添加表单提交逻辑
          const form = document.getElementById('edit-form') as HTMLFormElement;
          if (form) {
            form.requestSubmit();
          }
        }}
        width={800}
        okText="保存修改"
        cancelText="取消"
      >
        <Form
          id="edit-form"
          layout="vertical"
          onFinish={handleEditSubmit}
          initialValues={{
            aiResponse: editingConversation?.aiResponse || ''
          }}
        >
          <Form.Item
            name="aiResponse"
            label="AI方案内容"
            rules={[{ required: true, message: '请输入AI方案内容' }]}
          >
            <TextArea
              rows={12}
              placeholder="请编辑AI生成的旅游方案..."
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 语音配置模态框 */}
      <VoiceConfigModal
        visible={voiceConfigVisible}
        onCancel={() => setVoiceConfigVisible(false)}
        onSave={() => {
          setVoiceConfigVisible(false);
          antdMessage.success('语音配置已保存，现在可以使用语音输入功能了！');
        }}
      />
    </div>
  );
};

export default ChatPage;
