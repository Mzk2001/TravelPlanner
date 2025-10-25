import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, List, Avatar, Spin, message, Form, Modal, Row, Col, DatePicker, Select, InputNumber, Space } from 'antd';
import { SendOutlined, AudioOutlined, UserOutlined, RobotOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { conversationAPI, planAPI } from '../services/api';
import VoiceRecorder from '../components/VoiceRecorder';
import useVoiceRecognition from '../hooks/useVoiceRecognition';
import dayjs from 'dayjs';

const { TextArea } = Input;

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const messagesEndRef = useRef(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState(null);
  const [voiceRecorderVisible, setVoiceRecorderVisible] = useState(false);
  
  // 语音识别Hook
  const {
    isRecording: isVoiceRecording,
    isProcessing: isVoiceProcessing,
    error: voiceError,
    transcript,
    interimTranscript,
    startRecording: startVoiceRecording,
    stopRecording: stopVoiceRecording,
    clearError: clearVoiceError,
    clearTranscript
  } = useVoiceRecognition();
  
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

  // 处理语音识别结果
  useEffect(() => {
    if (transcript) {
      // 将语音识别结果设置到表单中
      form.setFieldsValue({ message: transcript });
    }
  }, [transcript, form]);

  // 处理实时语音识别结果
  useEffect(() => {
    if (interimTranscript) {
      // 显示实时识别结果
      form.setFieldsValue({ message: transcript + interimTranscript });
    }
  }, [interimTranscript, transcript, form]);

  // 处理语音错误
  useEffect(() => {
    if (voiceError) {
      message.error(voiceError);
      clearVoiceError();
    }
  }, [voiceError, clearVoiceError]);

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
        createdAt: new Date().toISOString(),
        processingTime: aiResponse.processingTime,
        extractedFields: aiResponse.extractedFields
      };
      
      // 调试信息
      console.log('AI回复内容:', aiResponse.message);
      console.log('AI回复长度:', aiResponse.message?.length);
      console.log('处理时间:', aiResponse.processingTime);
      console.log('提取的字段:', aiResponse.extractedFields);
      console.log('新消息对象:', newAiMessage);
      
      setMessages(prev => {
        const updated = [...prev, newAiMessage];
        console.log('更新后的消息列表:', updated);
        return updated;
      });

    } catch (error) {
      message.error('发送消息失败');
      // 移除失败的用户消息
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  // 保存旅行计划
  const handleSavePlan = async (messageItem) => {
    if (!messageItem.aiResponse) {
      message.error('没有可保存的内容');
      return;
    }

    if (!user || !user.id) {
      message.error('用户未登录');
      return;
    }

    try {
      console.log('保存计划 - 消息信息:', {
        id: messageItem.id,
        aiResponse: messageItem.aiResponse?.substring(0, 100) + '...',
        extractedFields: messageItem.extractedFields,
        hasExtractedFields: !!messageItem.extractedFields
      });

      // 如果有提取的字段，使用新的API方法
      if (messageItem.extractedFields && messageItem.aiResponse) {
        console.log('✅ 使用提取字段保存计划:', messageItem.extractedFields);
        const response = await conversationAPI.saveAsPlanWithFields({
          userId: user.id,
          aiResponse: messageItem.aiResponse,
          extractedFields: messageItem.extractedFields
        });
        message.success('旅行计划保存成功！已自动填充提取的字段');
        
        // 保存计划ID，用于后续编辑
        setSavedPlanId(response.data.planId);
      } else {
        console.log('⚠️ 没有提取字段，使用原有方法保存');
        // 使用原有的方法
        const response = await conversationAPI.saveAsPlan({
          userId: user.id,
          userMessage: messageItem.userMessage || 'AI生成的旅行计划',
          aiResponse: messageItem.aiResponse
        });
        message.success('旅行计划保存成功！');
        
        // 保存计划ID，用于后续编辑
        setSavedPlanId(response.data.id);
      }
      
    } catch (error) {
      console.error('保存计划失败:', error);
      message.error('保存计划失败，请重试');
    }
  };

  // 编辑旅行计划
  const handleEditPlan = async () => {
    if (!savedPlanId) {
      message.error('没有可编辑的计划');
      return;
    }
    
    try {
      // 获取已保存的计划数据
      const response = await planAPI.getPlan(savedPlanId);
      const planData = response.data;
      
      // 设置表单初始值
      editForm.setFieldsValue({
        planName: planData.planName || `旅行计划_${new Date().toLocaleDateString()}`,
        destination: planData.destination || '待定',
        travelType: planData.travelType || '休闲',
        groupSize: planData.groupSize || 1,
        budget: planData.budget || null,
        specialRequirements: planData.specialRequirements || '',
        dateRange: planData.startDate && planData.endDate ? [
          dayjs(planData.startDate),
          dayjs(planData.endDate)
        ] : null
      });
      
      setEditModalVisible(true);
    } catch (error) {
      console.error('获取计划数据失败:', error);
      message.error('获取计划数据失败，请重试');
    }
  };

  // 提交编辑
  const handleEditSubmit = async (values) => {
    if (!savedPlanId) return;
    
    try {
      const updateData = {
        planName: values.planName,
        destination: values.destination,
        budget: values.budget,
        groupSize: values.groupSize,
        travelType: values.travelType,
        specialRequirements: values.specialRequirements,
        startDate: values.dateRange && values.dateRange[0] ? 
          values.dateRange[0].format('YYYY-MM-DD') + 'T00:00:00.000Z' : null,
        endDate: values.dateRange && values.dateRange[1] ? 
          values.dateRange[1].format('YYYY-MM-DD') + 'T23:59:59.999Z' : null,
      };
      
      console.log('发送的更新数据:', updateData);
      
      await planAPI.updatePlan(savedPlanId, updateData);
      message.success('计划更新成功！');
      setEditModalVisible(false);
      
      // 重新加载计划数据
      if (planId) {
        loadPlan();
      }
      
    } catch (error) {
      console.error('更新计划失败:', error);
      message.error('更新计划失败，请重试');
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

  // 处理语音录制完成
  const handleVoiceRecordingComplete = (audioBlob) => {
    handleVoiceMessage(audioBlob);
  };

  // 处理语音录制取消
  const handleVoiceRecordingCancel = () => {
    setVoiceRecorderVisible(false);
  };

  // 语音识别处理
  const handleVoiceRecognition = () => {
    if (!user) return;
    
    if (isVoiceRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
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
                        
                        {/* 显示提取的字段 */}
                        {msg.extractedFields && (
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
                              {msg.extractedFields.destination && (
                                <span style={{ 
                                  background: '#f0f0f0', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}>
                                  🏛️ 目的地: {msg.extractedFields.destination}
                                </span>
                              )}
                              {msg.extractedFields.budget && (
                                <span style={{ 
                                  background: '#f0f0f0', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}>
                                  💰 预算: ¥{msg.extractedFields.budget}
                                </span>
                              )}
                              {msg.extractedFields.groupSize && (
                                <span style={{ 
                                  background: '#f0f0f0', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}>
                                  👥 人数: {msg.extractedFields.groupSize}人
                                </span>
                              )}
                              {msg.extractedFields.travelType && (
                                <span style={{ 
                                  background: '#f0f0f0', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}>
                                  🎯 类型: {msg.extractedFields.travelType}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {msg.voiceFileUrl && (
                          <div style={{ marginTop: '8px' }}>
                            <audio controls>
                              <source src={msg.voiceFileUrl} type="audio/mpeg" />
                            </audio>
                          </div>
                        )}
                        
                        {/* 显示处理时间 */}
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#999',
                          marginTop: 4,
                          textAlign: 'right'
                        }}>
                          {msg.processingTime > 0 && (
                            <span>处理时间: {msg.processingTime}ms</span>
                          )}
                        </div>
                        
                        {/* 保存和编辑按钮 - 只在AI回复后显示 */}
                        {msg.aiResponse && (
                          <div style={{ marginTop: '8px', textAlign: 'right' }}>
                            <Space>
                              <Button 
                                type="primary" 
                                size="small"
                                onClick={() => handleSavePlan(msg)}
                                icon={<SaveOutlined />}
                              >
                                保存为旅行计划
                              </Button>
                              {savedPlanId && (
                                <Button 
                                  type="default" 
                                  size="small"
                                  onClick={handleEditPlan}
                                  icon={<EditOutlined />}
                                >
                                  编辑计划
                                </Button>
                              )}
                            </Space>
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
            <Button 
              type={isVoiceRecording ? "primary" : "default"}
              icon={<AudioOutlined />}
              onClick={handleVoiceRecognition}
              disabled={loading}
              style={{ 
                backgroundColor: isVoiceRecording ? '#ff4d4f' : undefined,
                color: isVoiceRecording ? 'white' : undefined,
                borderColor: isVoiceRecording ? '#ff4d4f' : undefined
              }}
            >
              {isVoiceRecording ? '停止录音' : '语音识别'}
            </Button>
          </div>
          
          {/* 语音识别状态显示 */}
          {isVoiceRecording && (
            <div style={{ 
              marginTop: '8px',
              padding: '8px 12px', 
              backgroundColor: '#fff2f0', 
              border: '1px solid #ffccc7', 
              borderRadius: '6px',
              fontSize: '14px',
              color: '#ff4d4f'
            }}>
              🎤 正在录音中... {interimTranscript && `"${interimTranscript}"`}
            </div>
          )}
        </Form>
      </Card>

      {/* 编辑计划模态框 */}
      <Modal
        title="编辑旅行计划"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="planName"
            label="计划名称"
            rules={[{ required: true, message: '请输入计划名称' }]}
          >
            <Input placeholder="例如：北京三日游" />
          </Form.Item>

          <Form.Item
            name="destination"
            label="目的地"
            rules={[{ required: true, message: '请输入目的地' }]}
          >
            <Input placeholder="例如：北京" />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="出行日期"
          >
            <DatePicker.RangePicker 
              style={{ width: '100%' }}
              placeholder={['出发日期', '返回日期']}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="budget"
                label="预算 (元)"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  placeholder="例如：5000"
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/¥\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="groupSize"
                label="出行人数"
                rules={[{ required: true, message: '请输入出行人数' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={1}
                  max={20}
                  placeholder="例如：2"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="travelType"
            label="旅行类型"
            rules={[{ required: true, message: '请选择旅行类型' }]}
          >
            <Select placeholder="请选择旅行类型">
              <Select.Option value="休闲">休闲</Select.Option>
              <Select.Option value="商务">商务</Select.Option>
              <Select.Option value="探险">探险</Select.Option>
              <Select.Option value="文化">文化</Select.Option>
              <Select.Option value="美食">美食</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="specialRequirements"
            label="特殊要求"
          >
            <TextArea 
              rows={4}
              placeholder="请输入特殊要求或备注..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存修改
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 语音录制模态框 */}
      <VoiceRecorder
        visible={voiceRecorderVisible}
        onRecordingComplete={handleVoiceRecordingComplete}
        onCancel={handleVoiceRecordingCancel}
        onClose={() => setVoiceRecorderVisible(false)}
      />
    </div>
  );
};

export default ChatPage;


